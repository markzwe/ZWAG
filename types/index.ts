// Core type definitions for ZWAG app
import { Id } from "@/convex/_generated/dataModel";

// ==================== ITEM TYPES ====================
export interface Item {
  _id: Id<"items">;
  imageUrl: string;
  category: ClothingCategory;
  subcategory: string;
  color: string;
  caption: string;
  style: string[];
  brand?: string;
  userId: string;
  _creationTime: number;
}

export type ClothingCategory = 
  | "Tops" 
  | "Bottoms" 
  | "Outerwear" 
  | "Shoes" 
  | "Full Body" 
  | "Accessories";

export const CLOTHING_CATEGORIES: Record<string, ClothingCategory> = {
  top: "Tops",
  bottom: "Bottoms",
  outerwear: "Outerwear",
  shoes: "Shoes",
  fullbody: "Full Body",
  accessories: "Accessories",
} as const;

// ==================== OUTFIT TYPES ====================
export interface OutfitItem {
  top: Id<"items">;
  bottom: Id<"items">;
  shoes?: Id<"items">;
  outerwear?: Id<"items">;
  accessories?: Id<"items">[];
  fullBody?: Id<"items">;
}

export interface Outfit {
  _id: Id<"outfits">;
  userId: string;
  items: OutfitItem;
  name?: string;
  occasion?: string;
  weather?: string;
  _creationTime: number;
}

// ==================== AI GENERATION TYPES ====================
export interface OutfitGenerationContext {
  occasion: string;
  weather: string;
  preferredItemsId: string[];
}

export interface ItemForAI {
  id: Id<"items">;
  category: string;
  subcategory: string;
  color: string;
  caption: string;
  style: string[];
}

// ==================== UI COMPONENT TYPES ====================
export interface CategoryPreview {
  name: ClothingCategory;
  count: number;
  images: string[];
}

export interface PreviewItem {
  label: string;
  url: string;
}

// ==================== NAVIGATION TYPES ====================
export type RootStackParamList = {
  "(tabs)": undefined;
  "(auth)": undefined;
  "onBoardingScreens": undefined;
  "screens/closet/browseItems": { categoryName?: ClothingCategory };
  "screens/closet/addItem": undefined;
  "screens/generateOutfit/generateOutfits": undefined;
};

// ==================== ERROR TYPES ====================
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ZwagError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ZwagError";
  }
}

// ==================== UTILITY TYPES ====================
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

// ==================== STYLE PREFERENCES TYPES ====================
export interface StylePreferences {
  favoriteColors: string[];
  preferredStyles: string[];
  occasions: string[];
  bodyMeasurements?: Record<string, number>;
}

export interface User {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  stylePreferences?: StylePreferences;
  _creationTime: number;
}
