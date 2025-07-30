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

const createPrompt = (items: Item[], context: Context): string =>
`
Fashion Stylist Task: Create outfit from wardrobe

ITEMS (${items.length} total):
${items.map(item => 
    `${item.id}|${item.category}|${item.subcategory}|${item.color}|${item.caption.slice(0,20)}`
).join('\n')}
PREFERRED ITEMS: ${context.preferredItemsId.join(', ')}
OCCASION: ${context.occasion}
WEATHER: ${context.weather}

Rules: Fashion-first thinking. Mix unexpected combinations if stylish. Consider proportions, textures, modern trends.

OUTPUT (JSON only):
{"top":"id","bottom":"id","shoes":"id",outerwear:"id","asscessories":"id"}
`;
export const generateOutfitPrompt = (items: Item[], context: Context): string => {
    return createPrompt(items, context);
}