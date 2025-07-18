import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
    args: {
      clerkId: v.string(),
      email: v.string(),
      //Personalization fields
      birthYear: v.optional(v.number()),
      height: v.optional(v.number()), // in ft
      weight: v.optional(v.number()), // in lbs
      stylePreferences: v.optional(v.array(v.string())), // e.g. ["techwear", "vintage"]
      favoriteColors: v.optional(v.array(v.string())),   // e.g. ["black", "white"]
      bodyType: v.optional(v.string()),                 // e.g. "slim, triangle"
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

//helper function 
export async function getAuthenticatedUser(ctx: QueryCtx |  MutationCtx ) {

    const identity = await ctx.auth.getUserIdentity();

       if (!identity) throw new Error("Unauthorized")

       const currentUser = await ctx.db.query("users").withIndex(
           "byClerkId", (q) => q.eq("clerkId", identity.subject))
           .first();
        if(!currentUser) throw new Error("User not found");
        
        return currentUser;
   
}