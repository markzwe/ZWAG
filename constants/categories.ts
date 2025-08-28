export const CATEGORY_OPTIONS = [
  "Tops",
  "Bottoms", 
  "Outerwear",
  "Shoes",
  "Full Body",
  "Accessories",
] as const;

export const SUBCATEGORY_OPTIONS: Record<string, readonly string[]> = {
  Tops: [
    "T-Shirts",
    "Shirts",
    "Tank Tops",
    "Sweaters",
    "Polos",
    "Henleys",
    "Dress Shirts",
    "Long Sleeve Shirts",
    "Short Sleeve Shirts",
    "Hoodies",
    "Cardigans",
    "Vests",
  ] as const,
  
  Bottoms: [
    "Jeans",
    "Chinos",
    "Dress Pants",
    "Shorts",
    "Joggers",
    "Sweatpants",
    "Cargo Pants",
    "Khakis",
  ] as const,
  
  Outerwear: [
    "Jackets",
    "Coats",
    "Blazers",
    "Bomber Jackets",
    "Denim Jackets",
    "Leather Jackets",
    "Parkas",
    "Windbreakers",
    "Raincoats",
  ] as const,
  
  Shoes: [
    "Sneakers",
    "Dress Shoes",
    "Boots",
    "Loafers",
    "Sandals",
    "Oxfords",
    "Derby Shoes",
    "Chelsea Boots",
    "Monk Straps",
  ] as const,
  
  Accessories: [
    "Hats",
    "Bags",
    "Jewelry",
    "Belts",
    "Watches",
    "Sunglasses",
    "Scarves",
    "Ties",
    "Pocket Squares",
    "Cufflinks",
  ] as const,
  
  "Full Body": [
    "Suits",
    "Dresses", 
    "Jumpsuits",
    "Rompers",
    "Coveralls",
  ] as const,
} as const;

// Type helpers
export type Category = typeof CATEGORY_OPTIONS[number];
export type Subcategory<T extends Category> = typeof SUBCATEGORY_OPTIONS[T][number];
