import { ConvexError, v } from "convex/values";
import { buildCandidates, outfitIds, outfitSignature, validateOutfit, type ClosetCandidate } from "../lib/outfitRules";
import { internalQuery, mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireActiveUser } from "./users";
import { outfitDataValidator, sourceValidator } from "./outfitDataValidators";

export function closetCandidates(items: Doc<"items">[]): ClosetCandidate[] {
  return items.map(item => ({ id: item._id, category: item.category, subcategory: item.subcategory, caption: item.caption, color: item.color ?? "", style: item.style }));
}

export interface GenerationContext {
  items: Doc<"items">[];
  previousOutfits: Doc<"outfitHistory">["outfit"][];
}

export const generationContext = internalQuery({
  args: {},
  handler: async (ctx): Promise<GenerationContext> => {
    const user = await requireActiveUser(ctx);
    const items = await ctx.db.query("items").withIndex("by_userId", q => q.eq("userId", user._id)).collect();
    const history = await ctx.db.query("outfitHistory").withIndex("by_user", q => q.eq("userId", user._id)).collect();
    return { items, previousOutfits: history.map(entry => entry.outfit) };
  },
});

export const recordShown = mutation({
  args: { outfit: outfitDataValidator, source: sourceValidator, occasion: v.string(), eventId: v.string() },
  handler: async (ctx, args): Promise<Id<"outfitHistory">> => {
    const user = await requireActiveUser(ctx);
    const existing = await ctx.db.query("outfitHistory").withIndex("by_user_event", q => q.eq("userId", user._id).eq("eventId", args.eventId)).first();
    if (existing) {
      if (existing.signature !== outfitSignature(args.outfit)) throw new ConvexError("This display event already refers to another outfit.");
      return existing._id;
    }
    // Validate again at write time: items may have been changed/deleted since generation.
    const items = await ctx.db.query("items").withIndex("by_userId", q => q.eq("userId", user._id)).collect();
    const checked = validateOutfit(args.outfit, buildCandidates(closetCandidates(items)));
    if (!checked.outfit) throw new ConvexError(checked.errors.join(" "));
    const signature = outfitSignature(checked.outfit);
    const repeated = await ctx.db.query("outfitHistory").withIndex("by_user_signature", q => q.eq("userId", user._id).eq("signature", signature)).first();
    if (repeated) throw new ConvexError("This outfit was already shown. Please request another outfit.");
    return await ctx.db.insert("outfitHistory", {
      userId: user._id, ...args, signature,
      itemIds: outfitIds(checked.outfit) as Id<"items">[], shownAt: Date.now(),
    });
  },
});

export const logFeedback = mutation({
  args: {
    historyId: v.id("outfitHistory"),
    action: v.union(v.literal("dislike"), v.literal("try_another")),
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveUser(ctx);
    const history = await ctx.db.get(args.historyId);
    if (!history || history.userId !== user._id) throw new ConvexError("Outfit not found.");
    const existing = await ctx.db.query("outfitFeedback").withIndex("by_user_event", q => q.eq("userId", user._id).eq("eventId", args.eventId)).first();
    if (existing) {
      if (existing.historyId !== args.historyId || existing.action !== args.action) throw new ConvexError("Feedback event already used.");
      return existing._id;
    }
    return await ctx.db.insert("outfitFeedback", {
      ...args, userId: user._id, itemIds: history.itemIds, createdAt: Date.now(),
    });
  },
});
