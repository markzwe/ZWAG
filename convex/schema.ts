import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { outfitFields, outfitDataValidator, sourceValidator } from "./outfitDataValidators";

export default defineSchema({

  //User table to store user information
    users: defineTable({
      clerkId: v.string(),
      email: v.string(),
      //Personalization fields
      birthYear: v.optional(v.number()),
      height: v.optional(v.string()), // e.g., "5'10'' or 178cm"
      weight: v.optional(v.string()), // e.g., "165 lbs or 75 kg"
      stylePreferences: v.optional(v.array(v.string())), // e.g. ["techwear", "vintage"]
      favoriteColors: v.optional(v.array(v.string())),   // e.g. ["black", "white"]
      bodyType: v.optional(v.string()),                 // e.g. "slim, triangle"
      fitPreference: v.optional(v.string()),             // e.g. "oversized", "slim"
      avoidClothing: v.optional(v.string()),             // clothing types to avoid
      preferredOccasions: v.optional(v.array(v.string())), // e.g. ["work", "casual"]
      preferredBrands: v.optional(v.string()),           // comma-separated brands
      seasonalOutfits: v.optional(v.boolean()), // Legacy field; no longer read or written.

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
      ...outfitFields,
      
  })
  .index("byUser", ["userId"]),


  outfitHistory: defineTable({
    userId: v.id("users"),
    outfit: outfitDataValidator,
    itemIds: v.array(v.id("items")),
    signature: v.string(),
    eventId: v.string(),
    occasion: v.string(),
    weather: v.optional(v.string()), // Legacy history only; new outfits omit it.
    source: sourceValidator,
    shownAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_signature", ["userId", "signature"])
    .index("by_user_event", ["userId", "eventId"]),

  outfitFeedback: defineTable({
    userId: v.id("users"),
    historyId: v.id("outfitHistory"),
    itemIds: v.array(v.id("items")),
    action: v.union(v.literal("save"), v.literal("dislike"), v.literal("try_another")),
    eventId: v.string(),
    savedOutfitId: v.optional(v.id("outfits")),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"]),

 // inviteCodes schema updated to match convex/inviteCodes.ts implementation
  inviteCodes: defineTable({
    code: v.string(), // e.g. "ZWAG2023"
    maxUses: v.optional(v.number()), // number of allowed uses
    redeemedBy: v.optional(v.array(v.string())), // list of clerk user ids who redeemed
    createdAt: v.optional(v.number()), // timestamp ms
    expiresAt: v.optional(v.number()), // optional expiration timestamp ms since epoch
  }).index("byCode", ["code"]),
});
