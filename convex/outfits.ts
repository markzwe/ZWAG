import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";
import { Id } from "./_generated/dataModel";
export const saveOutfit = mutation({
    args: {
            top: v.id('items'),
            bottom: v.id('items'),
            shoes: v.optional(v.id('items')),
            outerwear: v.optional(v.id('items')),
            accessories: v.optional(v.array(v.id('items'))),
            fullBody: v.optional(v.id('items')),
    
    },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const outfit = {
            userId: currentUser._id,
            top: args.top,
            bottom: args.bottom,
            shoes: args.shoes,
            outerwear: args.outerwear,
            accessories: args.accessories,
            fullBody: args.fullBody,
        };
        const outfitId = await ctx.db.insert("outfits", outfit);
        }
})
export const getOutfitByOutfitId = query({
    args: {
        outfitId: v.id('outfits'),
    },
    handler: async (ctx, { outfitId }) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const outfit = await ctx.db.get(outfitId);
        return outfit;
    }
})
export const getOutfits = query({
    handler: async (ctx) => {
        // Get the authenticated user
        const currentUser = await getAuthenticatedUser(ctx);
   
        // Query outfits for the current user
        const outfits =  await ctx.db.query("outfits")
        .filter(q => q.eq(q.field("userId"), currentUser._id)).collect();
        return outfits;
    }
    
})



export const deleteOutfit = mutation({  
    args: {
        outfitId: v.id('outfits'),
    },
    handler: async (ctx, { outfitId }) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const outfit = await ctx.db.get(outfitId);
        if (!outfit || outfit.userId !== currentUser._id) {
            throw new Error("Outfit not found or unauthorized");
        }
        await ctx.db.delete(outfitId);
    }
});