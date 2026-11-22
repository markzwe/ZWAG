import { generateOutfitPrompt } from "../config/gptPrompt";
import { API_CONSTANTS } from "../constants/app";
import { buildCandidates, outfitSignature, ruleBasedOutfit, validateOutfit } from "../lib/outfitRules";
import { ConvexError, v } from "convex/values";
import OpenAI from "openai";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { closetCandidates, type GenerationContext } from "./outfitHistory";
import { outfitDataValidator, sourceValidator } from "./outfitDataValidators";

export interface GeneratedOutfit {
  outfit: Doc<"outfitHistory">["outfit"];
  source: "ai" | "rules";
  occasion: string;
}

export const analyzeOutfit = action({
  args: { preferredItemsId: v.array(v.string()), occasion: v.optional(v.string()), instructions: v.optional(v.string()) },
  returns: v.object({ outfit: outfitDataValidator, source: sourceValidator, occasion: v.string() }),
  handler: async (ctx, args): Promise<GeneratedOutfit> => {
    // The server-side generator always starts from the canonical per-user closet state,
    // never from any client-provided item list. We group closet items into category slots,
    // seed a rule-based fallback so we always have a valid outfit, and then optionally
    // ask the model to improve that result while ensuring the final selection still passes
    // the strict outfit validator and avoids repeating prior outfits.
    // Never trust client-supplied closet records or cross-user item IDs.
    const data: GenerationContext = await ctx.runQuery(internal.outfitHistory.generationContext, {});
    const occasion = args.occasion || API_CONSTANTS.DEFAULT_VALUES.OCCASION;
    const candidates = buildCandidates(closetCandidates(data.items), args.preferredItemsId);
    const previous = new Set(data.previousOutfits.map(outfitSignature));
    const fallback = ruleBasedOutfit(candidates, previous);
    if (!fallback) throw new ConvexError("No new complete outfit is available. Add a suitable top and bottom, or a full-body item, and try again.");

    const eligibleIds = new Set(Object.values(candidates).flat().map(item => item.id));
    const prompt = generateOutfitPrompt(candidates, {
      occasion,
      preferredItemsId: args.preferredItemsId.filter(id => eligibleIds.has(id)),
      previousOutfits: data.previousOutfits,
      ...(args.instructions && { instructions: args.instructions.slice(0, 6000) }),
    });
    let source: GeneratedOutfit["source"] = "rules";
    let selection = fallback;
    try {
      const openai = new OpenAI({
        ...(process.env.CONVEX_OPENAI_BASE_URL && { baseURL: process.env.CONVEX_OPENAI_BASE_URL }),
        apiKey: process.env.CONVEX_OPENAI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || "",
        timeout: API_CONSTANTS.OPENAI.TIMEOUT,
        maxRetries: 0, // Exactly one repair attempt for invalid output; no hidden SDK retries.
      });
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: "user", content: prompt }];
      for (let attempt = 0; attempt < 2; attempt++) {
        const response = await openai.chat.completions.create({
          model: process.env.CONVEX_OPENAI_MODEL || API_CONSTANTS.OPENAI.MODEL,
          messages, reasoning_effort: "low", max_completion_tokens: 2048,
          response_format: { type: "json_object" },
        });
        const content = response.choices[0]?.message?.content ?? "";
        let parsed: unknown;
        try { parsed = JSON.parse(content); } catch { parsed = null; }
        const checked = validateOutfit(parsed, candidates, previous);
        if (checked.outfit) { selection = checked.outfit; source = "ai"; break; }
        messages.push({ role: "assistant", content }, { role: "user", content: `Invalid outfit: ${checked.errors.join(" ")} Return a corrected JSON outfit using only the candidates. Do not repeat a previous outfit.` });
      }
    } catch {
      // Provider/network/quota failures still produce a validated local outfit.
      console.warn("Outfit model unavailable; using the rule-based candidate selection.");
    }
    // Both paths go through the same final strict validator.
    const checked = validateOutfit(selection, candidates, previous);
    if (!checked.outfit) throw new ConvexError(checked.errors.join(" "));
    return { outfit: checked.outfit as GeneratedOutfit["outfit"], source, occasion };
  },
});
