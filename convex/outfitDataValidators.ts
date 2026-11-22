import { v } from "convex/values";
export const outfitFields = {
  top: v.optional(v.id("items")),
  bottom: v.optional(v.id("items")),
  fullBody: v.optional(v.id("items")),
  shoes: v.optional(v.id("items")),
  outerwear: v.optional(v.id("items")),
  accessories: v.optional(v.array(v.id("items"))),
};
export const outfitDataValidator = v.object(outfitFields);
export const sourceValidator = v.union(v.literal("ai"), v.literal("rules"));
