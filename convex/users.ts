import { v } from "convex/values";
import { internalMutation, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

export const createUser = mutation({
    args: {
      clerkId: v.string(),
      email: v.string(),
      //Personalization fields
      birthYear: v.optional(v.number()),
      height: v.optional(v.string()), // e.g., "5'10" or 178cm"
      weight: v.optional(v.string()), // e.g., "165 lbs or 75 kg"
      stylePreferences: v.optional(v.array(v.string())), // e.g. ["techwear", "vintage"]
      favoriteColors: v.optional(v.array(v.string())),   // e.g. ["black", "white"]
      bodyType: v.optional(v.string()),                 // e.g. "slim, triangle"
      fitPreference: v.optional(v.string()),             // e.g. "oversized", "slim"
      avoidClothing: v.optional(v.string()),             // clothing types to avoid
      preferredOccasions: v.optional(v.array(v.string())), // e.g. ["work", "casual"]
      preferredBrands: v.optional(v.string()),           // comma-separated brands
      seasonalOutfits: v.optional(v.boolean()),          // weather-based recommendations
      numberOfClothes: v.optional(v.number()), // Number of clothes user has
    },
    handler: async (ctx, args) => {
        // Check for existing user
        const existingUser = await ctx.db
            .query("users")
            .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existingUser) return;

        await ctx.db.insert("users", {
            ...args,
            numberOfClothes: 0
        });
    },
});

export const updateStylePreferences = mutation({
    args: {
      stylePreferences: v.optional(v.array(v.string())),
      favoriteColors: v.optional(v.array(v.string())),
      height: v.optional(v.string()),
      weight: v.optional(v.string()),
      fitPreference: v.optional(v.string()),
      avoidClothing: v.optional(v.string()),
      preferredOccasions: v.optional(v.array(v.string())),
      preferredBrands: v.optional(v.string()),
      seasonalOutfits: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx);
        
        await ctx.db.patch(user._id, {
          ...(args.stylePreferences !== undefined && { stylePreferences: args.stylePreferences }),
          ...(args.favoriteColors !== undefined && { favoriteColors: args.favoriteColors }),
          ...(args.height !== undefined && { height: args.height }),
          ...(args.weight !== undefined && { weight: args.weight }),
          ...(args.fitPreference !== undefined && { fitPreference: args.fitPreference }),
          ...(args.avoidClothing !== undefined && { avoidClothing: args.avoidClothing }),
          ...(args.preferredOccasions !== undefined && { preferredOccasions: args.preferredOccasions }),
          ...(args.preferredBrands !== undefined && { preferredBrands: args.preferredBrands }),
          ...(args.seasonalOutfits !== undefined && { seasonalOutfits: args.seasonalOutfits }),
        });
    },
});

export const deleteUserByClerkId = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.warn("No user found to delete for Clerk ID:", args.clerkId);
      return;
    }

    await ctx.db.delete(user._id);
  },
});
//helper function 
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized: No identity found.");
  }

  const currentUser = await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) {
    throw new Error(`User not found for Clerk ID: ${identity.subject}`);
  }

  return currentUser;
}

// Query to get current user's profile
export const getCurrentUser = query({
  handler: async (ctx) => {
    return await getAuthenticatedUser(ctx);
  },
});
