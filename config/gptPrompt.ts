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
    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
        const cat = item.category.toLowerCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as { [key: string]: Item[] });

    // Separate preferred items
    const preferredItems = items.filter(item => context.preferredItemsId.includes(item.id));
    const otherItems = items.filter(item => !context.preferredItemsId.includes(item.id));

    // Format items for display
    const formatItems = (items: Item[]) => 
        items.map(item => `${item.id}: ${item.color} ${item.subcategory} (${item.style.join(', ')})`).join('\n');

    return `You are creating a ${context.occasion} outfit for ${context.weather} weather.

${preferredItems.length > 0 ? `PREFERRED ITEMS:
${formatItems(preferredItems)}

OTHER ITEMS:
${formatItems(otherItems)}` : `AVAILABLE ITEMS:
${formatItems(items)}`}

REQUIREMENTS:
- Must include: top and bottom
- Include shoes if available: ${itemsByCategory['shoes'] ? 'Yes' : 'No'}
- Include outerwear if weather requires: ${itemsByCategory['outerwear'] ? 'Available' : 'None'}
- Add accessories if appropriate: ${itemsByCategory['accessories'] ? 'Available' : 'None'}

RULES:
- Only use IDs from the list above
- Each category needs a different ID
- Consider weather and occasion appropriateness
- Vary your selections to avoid repetition

Return only a JSON object with your selection:
{"top":"id","bottom":"id","shoes":"id","outerwear":"id","accessories":"id"}

Omit categories that don't apply or aren't available.`;
};

export const generateOutfitPrompt = (items: Item[], context: Context): string => {
    return createPrompt(items, context);
};