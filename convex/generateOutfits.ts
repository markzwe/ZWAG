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
    // Get items by calling the query from the items module
    
    // Filter preferred items if specified
    const filteredItems = preferredItemsId.length > 0 
      ? items.filter(item => preferredItemsId.includes(item._id))
      : items;

    // Map items to match Item interface (rename _id to id)
    const mappedItems = items.map(item => ({
      id: item._id,
      category: item.category,
      subcategory: item.subcategory,
      color: item.color,
      caption: item.caption,
      style: item.style,
    }));

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
        max_tokens: 150,
      });

      return response.choices[0].message.content || null;
    } catch (error) {
      console.error("Error generating outfit:", error);
      throw new Error("Failed to generate outfit");
    }
  },
});
