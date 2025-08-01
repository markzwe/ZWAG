import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";
import { Id } from "./_generated/dataModel";

export const generatedUploadUrl = mutation(async(ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
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
        const user = await getAuthenticatedUser(ctx);

        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if(!imageUrl) throw new Error("Image not found");
         

        const item = {
            userId: user._id,
            storageId: args.storageId,
            category: args.category,
            subcategory: args.subcategory,
            style: args.style,
            color: args.color,
            caption: args.caption,
            embedding: args.embedding,
            brand: args.brand, 
            imageUrl 
        };

        const itemId = await ctx.db.insert("items", item);

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
        const currentUser = await getAuthenticatedUser(ctx);

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
    const currentUser = await getAuthenticatedUser(ctx);
    const item = await ctx.db.get(itemId);

    if (!item || item.userId !== currentUser._id) {
      return null;
    }

    return item;
  },
});

export const getItemsForGenerateOutfit = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

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
    top: v.optional(v.id("items")),
    bottom: v.optional(v.id("items")),
    shoes: v.optional(v.id("items")),
    outerwear: v.optional(v.id("items")),
    accessories: v.optional(v.id("items")), // typo preserved if AI returns it this way
  },
  handler: async (ctx, outfit) => {
    const ids = Object.values(outfit).filter(Boolean);

    const allItems = await ctx.db
      .query("items")
      .filter((q) => q.or(...ids.map((id) => q.eq(q.field("_id"), id!))))
      .collect();

    const byId = Object.fromEntries(allItems.map((item) => [item._id, item]));

    return {
      top: outfit.top ? byId[outfit.top] : null,
      bottom: outfit.bottom ? byId[outfit.bottom] : null,
      shoes: outfit.shoes ? byId[outfit.shoes] : null,
      outerwear: outfit.outerwear ? byId[outfit.outerwear] : null,
      accessories: outfit.accessories ? byId[outfit.accessories] : null,
    };
  },
});

//used in askPrefrencedItem.tsx
export const getItemsByIds = query({
  args: { itemIds: v.array(v.id("items")) },
  handler: async (ctx, { itemIds }) => {
  const currentUser = await getAuthenticatedUser(ctx);

  const items = await ctx.db.query("items")
  .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
  .filter((q) =>
    q.or(...itemIds.map((id) => q.eq(q.field("_id"), id)))
  )
  .collect();

    return items;
  },
});


export const countItemsByCategory = query({
  handler: async (ctx) => {
    // Get the authenticated user
    const currentUser = await getAuthenticatedUser(ctx);

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
    const currentUser = await getAuthenticatedUser(ctx);

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
    const user = await getAuthenticatedUser(ctx);
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
      color: args.color,
      caption: args.caption,
      brand: args.brand,
    });

    return true;
  },
});
export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => { 
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Find the item, ensure it belongs to the user
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");
    if (item.userId !== user._id) throw new Error("Not authorized to delete this item");

    // Delete the item
    await ctx.db.delete(itemId);

    // delete the associated storage file
    await ctx.storage.delete(item.storageId as Id<"_storage">);

    return true;
  }
});