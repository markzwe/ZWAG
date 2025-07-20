import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

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
            imageUrl 
        };

        const itemId = await ctx.db.insert("items", item);

        return itemId;
    }
})

export const getItem = query({
    args: {
        category: v.optional(v.string()),
        subcategory: v.optional(v.string()),
        embedding: v.optional(v.array(v.float64())),
        color: v.optional(v.string()),
        caption: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Get the authenticated user
        // This will throw an error if the user is not authenticated
        const currentUser = await getAuthenticatedUser(ctx);
        
        // Start with the base query
        const items = ctx.db.query("items")
            .filter((q) => q.eq(q.field("userId"), currentUser._id));

        // Apply filters based on provided arguments
        if (args.caption) {
            items.filter((q) => q.eq(q.field("caption"), args.caption));
        }
        if (args.embedding) {
            items.filter((q) => q.eq(q.field("embedding"), args.embedding));
       
        }if (args.category) {
            items.filter((q) => q.eq(q.field("category"), args.category));
        }
        if (args.subcategory) {
            items.filter((q) => q.eq(q.field("subcategory"), args.subcategory));
        }
        if (args.color) {
            items.filter((q) => q.eq(q.field("color"), args.color));
        }
        
        return await items.collect();
    }
})

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

expo
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