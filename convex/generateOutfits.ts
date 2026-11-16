import { generateOutfitPrompt } from "@/config/gptPrompt";
import { API_CONSTANTS, ERROR_CODES } from "@/constants/app";
import { ItemForAI } from "@/types";
import { v } from "convex/values";
import OpenAI from "openai";
import { action } from "./_generated/server";

/**
 * Analyzes user's wardrobe items and generates outfit recommendations using AI.
 * 
 * @param items - Array of clothing items with metadata
 * @param occasion - Optional occasion context (defaults to "Casual")
 * @param weather - Optional weather context (defaults to "Sunny")
 * @param preferredItemsId - Array of preferred item IDs to include
 * @returns JSON string of outfit recommendations or null if generation fails
 */
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
    ),
    preferredItemsId: v.array(v.string()),
    occasion: v.optional(v.string()),
    weather: v.optional(v.string()),
  },
  handler: async (_, { items, occasion, weather, preferredItemsId }): Promise<string | null> => {
    try {
      // Validate input parameters
      if (!items || items.length === 0) {
        console.warn("No items provided for outfit generation");
        return null;
      }

      // Map items to match ItemForAI interface
      const mappedItems: ItemForAI[] = items.map(item => ({
        id: item._id,
        category: item.category,
        subcategory: item.subcategory,
        color: item.color,
        caption: item.caption,
        style: item.style,
      }));

      // Build a set of valid item IDs for validation
      const validItemIds = new Set(mappedItems.map(item => item.id));

      console.log(`Generating outfit for ${mappedItems.length} items`, {
        occasion: occasion || API_CONSTANTS.DEFAULT_VALUES.OCCASION,
        weather: weather || API_CONSTANTS.DEFAULT_VALUES.WEATHER,
        preferredItemsCount: preferredItemsId.length,
      });

      // Construct the prompt for the AI model
      const prompt = generateOutfitPrompt(
        mappedItems,
        {
          occasion: occasion || API_CONSTANTS.DEFAULT_VALUES.OCCASION,
          weather: weather || API_CONSTANTS.DEFAULT_VALUES.WEATHER,
          preferredItemsId: preferredItemsId || [],
        }
      );

      // Initialize OpenAI client
      const openai = new OpenAI({
        baseURL: process.env.CONVEX_OPENAI_BASE_URL,
        apiKey: process.env.CONVEX_OPENAI_API_KEY,
      });

      // Call OpenAI API with timeout and retry logic
      const response = await Promise.race([
        openai.chat.completions.create({
          model: API_CONSTANTS.OPENAI.MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI request timeout")), API_CONSTANTS.OPENAI.TIMEOUT)
        ),
      ]);

      // Parse and validate the AI response
      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        console.error("Empty response from OpenAI");
        return null;
      }

      let aiOutfit: Record<string, string>;
      try {
        aiOutfit = JSON.parse(responseContent);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", parseError, {
          content: responseContent.substring(0, 200),
        });
        return null;
      }

      // Validate and filter outfit items
      const validatedOutfit: Record<string, string> = {};
      let validItemCount = 0;

      Object.entries(aiOutfit).forEach(([key, itemId]) => {
        if (typeof itemId === 'string' && validItemIds.has(itemId as any)) {
          validatedOutfit[key] = itemId;
          validItemCount++;
        } else {
          console.warn(`Invalid item ID in AI response: ${itemId}`);
        }
      });

      if (validItemCount === 0) {
        console.error("No valid items in AI response");
        return null;
      }

      console.log(`Generated outfit with ${validItemCount} valid items`);
      return JSON.stringify(validatedOutfit);

    } catch (error) {
      console.error("Error generating outfit:", error);
      
      // Determine error type for better error handling
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          throw new Error(`${ERROR_CODES.AI_GENERATION_FAILED}: Request timeout`);
        }
        if (error.message.includes("network")) {
          throw new Error(`${ERROR_CODES.NETWORK_ERROR}: ${error.message}`);
        }
      }
      
      throw new Error(`${ERROR_CODES.AI_GENERATION_FAILED}: Failed to generate outfit`);
    }
  },
});
