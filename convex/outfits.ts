import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireActiveUser } from "./users";
import { buildCandidates, validateOutfit } from "../lib/outfitRules";
import { closetCandidates } from "./outfitHistory";
export const saveOutfit = mutation({
  args: { historyId: v.id("outfitHistory"), eventId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireActiveUser(ctx);
    const history = await ctx.db.get(args.historyId);
    if (!history || history.userId !== user._id) throw new ConvexError("Outfit not found.");
    const previous = await ctx.db.query("outfitFeedback").withIndex("by_user_event", q => q.eq("userId", user._id).eq("eventId", args.eventId)).first();
    if (previous) {
      if (previous.action !== "save" || previous.historyId !== history._id) throw new ConvexError("Feedback event already used.");
      return previous.savedOutfitId;
    }
    const items = await ctx.db.query("items").withIndex("by_userId", q => q.eq("userId", user._id)).collect();
    const checked = validateOutfit(history.outfit, buildCandidates(closetCandidates(items)));
    if (!checked.outfit) throw new ConvexError(checked.errors.join(" "));
    const outfit = history.outfit;
    const outfitId = await ctx.db.insert("outfits", {
      userId: user._id,
      ...(outfit.top && { top: outfit.top }), ...(outfit.bottom && { bottom: outfit.bottom }),
      ...(outfit.fullBody && { fullBody: outfit.fullBody }), ...(outfit.shoes && { shoes: outfit.shoes }),
      ...(outfit.outerwear && { outerwear: outfit.outerwear }), ...(outfit.accessories && { accessories: outfit.accessories }),
    });
    // Save and feedback are committed atomically.
    await ctx.db.insert("outfitFeedback", { ...args, userId: user._id, itemIds: history.itemIds, action: "save", savedOutfitId: outfitId, createdAt: Date.now() });
    return outfitId;
  },
});
export const getOutfitByOutfitId = query({
    args: {
        outfitId: v.id('outfits'),
    },
    handler: async (ctx, { outfitId }) => {
        const currentUser = await requireActiveUser(ctx);
        const outfit = await ctx.db.get(outfitId);
        return outfit?.userId === currentUser._id ? outfit : null;
    }
})
export const getOutfits = query({
    handler: async (ctx) => {
        // Get the authenticated user
        const currentUser = await requireActiveUser(ctx);
   
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
        const currentUser = await requireActiveUser(ctx);
        const outfit = await ctx.db.get(outfitId);
        if (!outfit || outfit.userId !== currentUser._id) {
            throw new Error("Outfit not found or unauthorized");
        }
        await ctx.db.delete(outfitId);
    }
});