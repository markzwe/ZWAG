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
    
    // Create lists of available categories
    const availableCategories = Object.keys(itemsBySubcategory);
    const requiredCategories = ['top', 'bottom'];
    const optionalCategories = ['shoes', 'outerwear', 'accessories'];
    
    // Separate preferred and non-preferred items for better visibility
    const preferredItems = items.filter(item => context.preferredItemsId.includes(item.id));
    const otherItems = items.filter(item => !context.preferredItemsId.includes(item.id));
    
    return `

Create a ${context.occasion} outfit for ${context.weather} weather. Do research the latest fashion trends and styles.

${preferredItems.length > 0 ? `
PREFERRED ITEMS (MUST TRY TO INCLUDE THESE FIRST):
${preferredItems.map(item => `${item.id}: ${item.subcategory} - ${item.color} ${item.caption} ⭐ PREFERRED`).join('\n')}

OTHER AVAILABLE ITEMS:
${otherItems.map(item => `${item.id}: ${item.subcategory} - ${item.color} ${item.caption}`).join('\n')}
` : `
Available items by category:
${items.map(item => `${item.id}: ${item.subcategory} - ${item.color} ${item.caption}`).join('\n')}
`}

CRITICAL RULES:
1. PRIORITIZE PREFERRED ITEMS: ${preferredItems.length > 0 ? 'MUST try to include as many preferred items (⭐) as possible in the outfit' : 'No preferred items specified'}
2. REQUIRED: Must include "top", "bottom",  "shoes", "outerwear", "accessories" these are mandatory
3. Choose available and appropriate for occasion and weather
4. ONLY use IDs from the exact list above - NO other values allowed
5. NEVER use empty strings ("") - omit the field entirely instead
6. Create variety - don't repeat the same combinations
7. Match colors and styles appropriately for ${context.weather} weather

VALID IDs BY CATEGORY:
${availableCategories.map(cat => 
    `${cat}: ${itemsBySubcategory[cat]?.join(', ')}`
).join('\n')}

RESPONSE FORMAT:
Return ONLY valid JSON with available categories. Example formats:

If you have top, bottom, shoes:
{"top":"id1","bottom":"id2","shoes":"id3"}

If you only have top and bottom:
{"top":"id1","bottom":"id2"}

If you have all categories:
{"top":"id1","bottom":"id2","shoes":"id3","outerwear":"id4","accessories":"id5"}

IMPORTANT: Do NOT include fields with empty strings. Only include fields with valid IDs.
`;
};

export const generateOutfitPrompt = (items: Item[], context: Context): string => {
    return createPrompt(items, context);
};