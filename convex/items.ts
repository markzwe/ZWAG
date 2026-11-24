import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { findUserByClerkId, requireActiveUser } from "./users";

export const canUpload = internalQuery({
    args: {},
    handler: async ctx => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;
        const user = await findUserByClerkId(ctx, identity.subject);
        return !!user && user.deletingAt === undefined;
    },
});

export const isUploadRegistered = internalQuery({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, { storageId }) =>
        !!await ctx.db.query("uploads").withIndex("byStorage", q => q.eq("storageId", storageId)).first(),
});

export const registerUpload = internalMutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, { storageId }) => {
        const user = await requireActiveUser(ctx);
        const pending = await ctx.db.query("uploads").withIndex("byUser", q => q.eq("userId", user._id)).take(10);
        if (pending.length >= 10) {
            // Reclaim the oldest unfinished upload when replacing it with a new one.
            await ctx.storage.delete(pending[0].storageId);
            await ctx.db.delete(pending[0]._id);
        }
        await ctx.db.insert("uploads", { userId: user._id, storageId });
    },
});

export const uploadItem = mutation({
    args: {
        storageId: v.id("_storage"),
        category: v.string(),
        subcategory: v.string(),
        style: v.array(v.string()), // e.g. ["casual", "formal"]
        color: v.optional(v.string()),
        caption: v.string(),
        brand: v.optional(v.string()),
        embedding: v.optional(v.array(v.float64())),
    },
    handler: async (ctx, args) => {
        const user = await requireActiveUser(ctx);

        const upload = await ctx.db.query("uploads").withIndex("byStorage", q => q.eq("storageId", args.storageId)).first();
        if (!upload || upload.userId !== user._id) throw new ConvexError("Upload this photo again to continue.");
        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if(!imageUrl) throw new Error("Image not found");
         

        const item = {
            userId: user._id,
            storageId: args.storageId,
            category: args.category,
            subcategory: args.subcategory,
            style: args.style,
            ...(args.color !== undefined && { color: args.color }),
            caption: args.caption,
            ...(args.embedding !== undefined && { embedding: args.embedding }),
            ...(args.brand !== undefined && { brand: args.brand }),
            imageUrl 
        };

        const itemId = await ctx.db.insert("items", item);

        await ctx.db.delete(upload._id);
        return itemId;
    }
})

export const getItem = query({
    args: {
        itemId: v.optional(v.id("items")),
        category: v.optional(v.union(v.string(), v.array(v.string()))),
        subcategory: v.optional(v.string()),
        embedding: v.optional(v.array(v.float64())),
        color: v.optional(v.string()),
        caption: v.optional(v.string()),
        style: v.optional(v.array(v.string())),
        brand: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Get the authenticated user
        const currentUser = await requireActiveUser(ctx);

        // Start with the base query
        let query = ctx.db.query("items").filter((q) => q.eq(q.field("userId"), currentUser._id));

        // Chain filters correctly
        if (args.caption) {
            query = query.filter((q) => q.eq(q.field("caption"), args.caption));
        }
        if (args.embedding) {
            query = query.filter((q) => q.eq(q.field("embedding"), args.embedding));
        }
        if (args.category !== undefined) {
            if (Array.isArray(args.category)) {
                query = query.filter((q) =>
                    q.or(...(args.category as string[]).map((cat: string) => q.eq(q.field("category"), cat)))
                );
            } else {
                query = query.filter((q) => q.eq(q.field("category"), args.category as string));
            }
        }
        if (args.subcategory) {
            query = query.filter((q) => q.eq(q.field("subcategory"), args.subcategory));
        }
        if (args.color) {
            query = query.filter((q) => q.eq(q.field("color"), args.color));
        }
        if (args.style) {
            query = query.filter((q) => q.eq(q.field("style"), args.style));
        }
        if (args.brand) {
            query = query.filter((q) => q.eq(q.field("brand"), args.brand));
        }
        if(args.itemId) {
            query = query.filter((q) => q.eq(q.field("_id"), args.itemId));
        }
        return await query.collect();
    }
})
export const getOneItemById = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const currentUser = await requireActiveUser(ctx);
    const item = await ctx.db.get(itemId);

    if (!item || item.userId !== currentUser._id) {
      return null;
    }

    return item;
  },
});

export const getItemsForGenerateOutfit = query({
  handler: async (ctx) => {
    const currentUser = await requireActiveUser(ctx);

    const items = await ctx.db.query("items")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .collect();
    // Remove `storageId` and `imageUrl`
    const cleanedItems = items.map(({ storageId, imageUrl, embedding,userId,_creationTime,brand, ...rest }) => rest);

    return cleanedItems;
    }
})


export const getOutfitItemsFromAi = query({
  args: {
    top: v.optional(v.id("items")), bottom: v.optional(v.id("items")),
    fullBody: v.optional(v.id("items")), shoes: v.optional(v.id("items")),
    outerwear: v.optional(v.id("items")),
    accessories: v.optional(v.union(v.id("items"), v.array(v.id("items")))),
  },
  handler: async (ctx, outfit) => {
    const user = await requireActiveUser(ctx);
    const accessoryIds = Array.isArray(outfit.accessories) ? outfit.accessories : outfit.accessories ? [outfit.accessories] : [];
    const ownedItem = async (id: Id<"items"> | undefined) => {
      if (!id) return null;
      const item = await ctx.db.get(id);
      return item?.userId === user._id ? item : null;
    };
    return {
      top: await ownedItem(outfit.top), bottom: await ownedItem(outfit.bottom),
      fullBody: await ownedItem(outfit.fullBody), shoes: await ownedItem(outfit.shoes),
      outerwear: await ownedItem(outfit.outerwear),
      accessories: (await Promise.all(accessoryIds.map(ownedItem))).filter(item => item !== null),
    };
  },
});

export const countItemsByCategory = query({
  handler: async (ctx) => {
    // Get the authenticated user
    const currentUser = await requireActiveUser(ctx);

    const items = await ctx.db
      .query("items")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .collect();

    const counts: Record<string, number> = {};

    for (const item of items) {
      const category = item.category;
      counts[category] = (counts[category] || 0) + 1;
    }

    return counts;
  },
});
export const getPreviewImageByCategory = query({
  handler: async (ctx): Promise<
    { category: string; images: string[] }[]
  > => {
    const currentUser = await requireActiveUser(ctx);

    const items = await ctx.db
      .query("items")
      .withIndex("by_userId_category", (q) =>
        q.eq("userId", currentUser._id)
      )
      .collect();

    const categoryImages: Record<string, string[]> = {};

    for (const item of items) {
      const category = item.category;
      if (!categoryImages[category]) {
        categoryImages[category] = [];
      }
      categoryImages[category].push(item.imageUrl);
    }

    return Object.entries(categoryImages).map(([category, images]) => ({
      category,
      images,
    }));
  },
});
export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    category: v.string(),
    subcategory: v.string(),
    style: v.array(v.string()),
    color: v.optional(v.string()),
    caption: v.string(),
    brand: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Find the item, ensure it belongs to the user
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    if (item.userId !== user._id) throw new Error("Not authorized to update this item");

    // Update item with new values
    await ctx.db.patch(args.itemId, {
      category: args.category,
      subcategory: args.subcategory,
      style: args.style,
      ...(args.color !== undefined && { color: args.color }),
      caption: args.caption,
      ...(args.brand !== undefined && { brand: args.brand }),
    });

    return true;
  },
});
export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => { 
    const user = await requireActiveUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Find the item, ensure it belongs to the user
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");
    if (item.userId !== user._id) throw new Error("Not authorized to delete this item");

    // Delete the item
    await ctx.db.delete(itemId);

    // delete the associated storage file
    const shared = await ctx.db.query("items").withIndex("byStorageId", q => q.eq("storageId", item.storageId))
      .filter(q => q.neq(q.field("_id"), item._id)).first();
    const storageId = ctx.db.system.normalizeId("_storage", item.storageId);
    if (!shared && storageId && await ctx.db.system.get("_storage", storageId)) await ctx.storage.delete(storageId);

    return true;
  }
});