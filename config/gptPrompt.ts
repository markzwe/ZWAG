interface Item {
    id: string;
    category: string;
    subcategory: string;
    color: string;
    caption: string;
    style: string[];
}

interface Context {
    occasion: string;
    weather: string;
    preferredItemsId: string[];
}

const createPrompt = (items: Item[], context: Context): string => {
    // Group items by subcategory for validation
    const itemsBySubcategory = items.reduce((acc, item) => {
        if (!acc[item.subcategory]) acc[item.subcategory] = [];
        acc[item.subcategory].push(item.id);
        return acc;
    }, {} as { [key: string]: string[] });
    
    return `
Create a ${context.occasion} outfit for ${context.weather} weather.

Available items:
${items.map(item => `${item.id}: ${item.subcategory} (${item.color})`).join('\n')}

Preferred items: ${context.preferredItemsId.join(', ') || 'none'}

RULES:
- top: choose from items with subcategory "top"
- bottom: choose from items with subcategory "bottom"  
- shoes: choose from items with subcategory "shoes"
- outerwear: choose from items with subcategory "outerwear"
- accessories: choose from items with subcategory "accessories"
- Use "" if no item available for category
- Match colors well together
- Appropriate for ${context.weather} weather

Valid IDs by category:
top: ${itemsBySubcategory.top?.join(', ') || 'none - use ""'}
bottom: ${itemsBySubcategory.bottom?.join(', ') || 'none - use ""'}
shoes: ${itemsBySubcategory.shoes?.join(', ') || 'none - use ""'}
outerwear: ${itemsBySubcategory.outerwear?.join(', ') || 'none - use ""'}
accessories: ${itemsBySubcategory.accessories?.join(', ') || 'none - use ""'}

Return only JSON:
{"top":"","bottom":"","shoes":"","outerwear":"","accessories":""}
`;
};

export const generateOutfitPrompt = (items: Item[], context: Context): string => {
    return createPrompt(items, context);
};