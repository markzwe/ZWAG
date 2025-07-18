import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({

  //User table to store user information
    users: defineTable({
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
    })
    .index("byClerkId", ["clerkId"]),

    // Each user's closet items
    // e.g. "white oversized hoodie", "black jeans"
    items: defineTable({
      userId: v.id("users"),
      imageUrl: v.string(), // image hosted on storage or CDN
      storageId: v.string(), // storage ID for the image
      caption: v.string(), // e.g. “white oversized hoodie”
      category: v.string(), // e.g. “top”, “bottom”, “outerwear”
      subcategory: v.optional(v.string()), // e.g. “t-shirt”, “jeans”
      color: v.optional(v.string()), // e.g. “black”, “navy”
      embedding: v.optional(v.array(v.float64())), // image vector
    })  
    .index("by_userId", ["userId"])
    .index("by_userId_category", ["userId", "category"])
    .index("by_userId_subcategory", ["userId", "subcategory"]),
    
    // Outfits created by users & AI
    outfits: defineTable({
      userId: v.id("users"),
      imageUrl: v.array(v.string()), // array of image URLs for the outfit
      description: v.optional(v.string()),
      items: v.array(v.id("items")),
  })
  .index("byUser", ["userId"])
  
});