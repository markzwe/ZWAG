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
      subcategory: v.string(), // e.g. “hoodie”, “jeans”
      style: v.array(v.string()), // e.g. ["casual", "formal"]
      color: v.optional(v.string()), // e.g. “black”, “navy”
      brand: v.optional(v.string()), // e.g. "Nike", "Adidas"
      embedding: v.optional(v.array(v.float64())), // image vector
    })  
    .index("by_userId", ["userId"])
    .index("by_userId_category", ["userId", "category"])
    .index("by_userId_color", ["userId", "color"])
    .index("by_userId_embedding", ["userId", "embedding"])
    .index("by_userId_caption", ["userId", "caption"])
    .index("by_userId_subcategory", ["userId", "subcategory"])
    .index("by_userId_style", ["userId", "style"])
    .index("by_userId_brand", ["userId", "brand"]),
    
    // Outfits created by users & AI
    outfits: defineTable({
      userId: v.id("users"),  
        top: v.id("items"),
        bottom: v.id("items"),
        shoes: v.optional(v.id("items")),
        outerwear: v.optional(v.id("items")),
        accessories: v.optional(v.array(v.id("items"))),
        fullBody: v.optional(v.id("items")),
      
  })
  .index("byUser", ["userId"])
});