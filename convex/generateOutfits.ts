import { generateOutfitPrompt } from "@/config/gptPrompt";
import { v } from "convex/values";
import OpenAI from "openai";
import { action } from "./_generated/server";

export const analyzeOutfit = action({
  args: {
    items: v.array(
        v.object({
            _id: v.id('items'),
            color: v.string(),
            caption: v.string(),
            category: v.string(),
            subcategory: v.string(),
            style: v.array(v.string()),
            })
    ), // Array of item objects
    preferredItemsId: v.array(v.string()),
    occasion: v.optional(v.string()),
    weather: v.optional(v.string()),
  },
  handler: async (ctx, { items, occasion, weather, preferredItemsId }): Promise<string | null> => {
    // Map items to match Item interface (rename _id to id)
    const mappedItems = items.map(item => ({
      id: item._id,
      category: item.category,
      subcategory: item.subcategory,
      color: item.color,
      caption: item.caption,
      style: item.style,
    }));

    // Build a set of valid item IDs for validation
    const validItemIds = new Set(mappedItems.map(item => item.id));

    // Construct the prompt for the AI model
    const prompt = generateOutfitPrompt(
      mappedItems,
      {
        occasion: occasion || "Casual",
        weather: weather || "Sunny",
        preferredItemsId: preferredItemsId || [],
      }
    );

    try {
      // Use the bundled OpenAI API
      const openai = new OpenAI({
        baseURL: process.env.CONVEX_OPENAI_BASE_URL,
        apiKey: process.env.CONVEX_OPENAI_API_KEY,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
      });

      // Parse and validate the AI response
      let aiOutfit;
      try {
        aiOutfit = JSON.parse(response.choices[0].message.content || '{}');
      } catch {
        return null;
      }
      // Filter out any IDs not in validItemIds
      Object.keys(aiOutfit).forEach(key => {
        if (!validItemIds.has(aiOutfit[key])) {
          delete aiOutfit[key];
        }
      });
      return JSON.stringify(aiOutfit);
    } catch (error) {
      console.error("Error generating outfit:", error);
      throw new Error("Failed to generate outfit");
    }
  },
});
