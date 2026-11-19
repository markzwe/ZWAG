// Centralized application constants
import { ClothingCategory } from "@/types";

// ==================== CLOTHING CATEGORIES ====================
export const CLOTHING_CATEGORIES: Record<string, ClothingCategory> = {
  top: "Tops",
  bottom: "Bottoms",
  outerwear: "Outerwear",
  shoes: "Shoes",
  fullbody: "Full Body",
  accessories: "Accessories",
} as const;

export const CATEGORY_DISPLAY_ORDER: ClothingCategory[] = [
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Full Body",
  "Accessories",
];

// ==================== UI CONSTANTS ====================
export const UI_CONSTANTS = {
  IMAGE_ROTATION_INTERVAL: 10000, // 10 seconds
  CANVAS_DIMENSIONS: {
    WIDTH: 350,
    HEIGHT: 500,
  },
  MAX_ACCESSORIES: 5,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

// ==================== TEXT CONSTANTS ====================
export const TEXT_CONSTANTS = {
  EMPTY_CLOSET: {
    TITLE: "No items found",
    SUBTITLE: "Start building your closet by adding your first item!",
    BUTTON_TEXT: "Add Item",
  },
  LOADING: {
    OUTFIT: "Loading outfit...",
    ITEMS: "Loading items...",
    GENERATING: "Generating outfit...",
  },
  SECTIONS: {
    BROWSE_ALL: "Browse All Items in Closet",
    BROWSE_ALL_SUBTITLE: "View your entire collection",
    BROWSE_BY_CATEGORIES: "Browse By Categories",
  },
  BUTTONS: {
    ADD_ITEM: "Add Item",
    SAVE_OUTFIT: "Save Outfit",
    GENERATE_NEW: "Generate New",
  },
} as const;

// ==================== API CONSTANTS ====================
export const API_CONSTANTS = {
  OPENAI: {
    MODEL: "gpt-5.6-luna",
    MAX_RETRIES: 3,
    TIMEOUT: 30000, // 30 seconds
  },
  DEFAULT_VALUES: {
    OCCASION: "Casual",
  },
} as const;

// ==================== ERROR CODES ====================
export const ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  AI_GENERATION_FAILED: "AI_GENERATION_FAILED",
  INVALID_ITEM_ID: "INVALID_ITEM_ID",
  VISION_KIT_UNAVAILABLE: "VISION_KIT_UNAVAILABLE",
  IMAGE_PROCESSING_FAILED: "IMAGE_PROCESSING_FAILED",
  CACHE_ERROR: "CACHE_ERROR",
} as const;

// ==================== ROUTE CONSTANTS ====================
export const ROUTES = {
  TABS: {
    INDEX: "/(tabs)/",
    GENERATE_OUTFITS: "/(tabs)/generateOutfits",
  },
  SCREENS: {
    CLOSET: {
      BROWSE_ITEMS: "/screens/closet/browseItems",
      ADD_ITEM: "/screens/closet/addItem",
    },
    GENERATE_OUTFIT: {
      CHAT: "/screens/generateOutfit/chat",
    },
  },
  AUTH: {
    SIGN_IN: "/(auth)/sign-in",
    SIGN_UP: "/(auth)/sign-up",
  },
  ONBOARDING: {
    WELCOME: "/onBoardingScreens/welcome",
    STYLE_QUESTIONNAIRE: "/onBoardingScreens/styleQuestionnaire",
    PAY_WALL: "/onBoardingScreens/payWall",
  },
} as const;

// ==================== LAYOUT CONSTANTS ====================
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 60,
  BUTTON_HEIGHT: 120,
  CARD_MIN_HEIGHT: 120,
  ICON_CONTAINER_SIZE: 48,
} as const;
