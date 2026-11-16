import { generateOutfitPrompt } from "../config/gptPrompt";
import { API_CONSTANTS } from "../constants/app";
import { buildCandidates, outfitSignature, ruleBasedOutfit, validateOutfit } from "../lib/outfitRules";
import { ConvexError, v } from "convex/values";
import OpenAI from "openai";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { closetCandidates, type GenerationContext } from "./outfitHistory";
import { outfitValidator, sourceValidator } from "./outfitValidators";

export interface GeneratedOutfit {
  outfit: Doc<"outfitHistory">["outfit"];
  source: "ai" | "rules";
  occasion: string;
  weather: string;
}

export const analyzeOutfit = action({
  args: { preferredItemsId: v.array(v.string()), occasion: v.optional(v.string()), weather: v.optional(v.string()), instructions: v.optional(v.string()) },
  returns: v.object({ outfit: outfitValidator, source: sourceValidator, occasion: v.string(), weather: v.string() }),
  handler: async (ctx, args): Promise<GeneratedOutfit> => {
    // Never trust client-supplied closet records or cross-user item IDs.
    const data: GenerationContext = await ctx.runQuery(internal.outfitHistory.generationContext, {});
    const occasion = args.occasion || API_CONSTANTS.DEFAULT_VALUES.OCCASION;
    const weather = args.weather || API_CONSTANTS.DEFAULT_VALUES.WEATHER;
    const candidates = buildCandidates(closetCandidates(data.items), weather, args.preferredItemsId);
    const previous = new Set(data.previousOutfits.map(outfitSignature));
    const fallback = ruleBasedOutfit(candidates, previous);
    if (!fallback) throw new ConvexError("No new complete outfit is available for this weather. Add a suitable top and bottom, or a full-body item, and try again.");

    const eligibleIds = new Set(Object.values(candidates).flat().map(item => item.id));
    const prompt = generateOutfitPrompt(candidates, {
      occasion, weather,
      preferredItemsId: args.preferredItemsId.filter(id => eligibleIds.has(id)),
      previousOutfits: data.previousOutfits,
      ...(args.instructions && { instructions: args.instructions.slice(0, 6000) }),
    });
    let source: GeneratedOutfit["source"] = "rules";
    let selection = fallback;
    try {
      const openai = new OpenAI({
        ...(process.env.CONVEX_OPENAI_BASE_URL && { baseURL: process.env.CONVEX_OPENAI_BASE_URL }),
        apiKey: process.env.CONVEX_OPENAI_API_KEY ?? "",
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
    return { outfit: checked.outfit as GeneratedOutfit["outfit"], source, occasion, weather };
  },
});
