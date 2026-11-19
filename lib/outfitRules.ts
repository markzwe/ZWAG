export const SLOTS = ["top", "bottom", "fullBody", "shoes", "outerwear", "accessories"] as const;
export type Slot = typeof SLOTS[number];
export type OutfitSelection = Partial<Record<Exclude<Slot, "accessories">, string | undefined>> & { accessories?: string[] | undefined };
export interface ClosetCandidate {
  id: string;
  category: string;
  subcategory: string;
  caption: string;
  color: string;
  style: string[];
}
export type Candidates = Record<Slot, ClosetCandidate[]>;
export const MAX_ACCESSORIES = 5;

export function categorySlot(category: string): Slot | undefined {
  const normalized = category.toLowerCase().replace(/[\s_-]/g, "");
  return ({ top: "top", tops: "top", bottom: "bottom", bottoms: "bottom", fullbody: "fullBody", shoes: "shoes", outerwear: "outerwear", accessories: "accessories" } as Record<string, Slot>)[normalized];
}

export function buildCandidates(items: ClosetCandidate[], preferred: string[] = []): Candidates {
  const candidates: Candidates = { top: [], bottom: [], fullBody: [], shoes: [], outerwear: [], accessories: [] };
  const seen = new Set<string>();
  for (const item of items) {
    const slot = categorySlot(item.category);
    if (!slot || seen.has(item.id)) continue;
    seen.add(item.id);
    candidates[slot].push(item);
  }
  for (const slot of SLOTS) {
    candidates[slot].sort((a, b) => Number(preferred.includes(b.id)) - Number(preferred.includes(a.id)) || a.id.localeCompare(b.id));
  }
  return candidates;
}

export function outfitIds(outfit: OutfitSelection): string[] {
  return SLOTS.flatMap(slot => slot === "accessories" ? (outfit.accessories ?? []) : (outfit[slot] ? [outfit[slot]!] : []));
}

export function outfitSignature(outfit: OutfitSelection): string {
  return JSON.stringify(outfitIds(outfit).sort());
}

export function validateOutfit(value: unknown, candidates: Candidates, previous: Set<string> = new Set()): { outfit?: OutfitSelection; errors: string[] } {
  const errors: string[] = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return { errors: ["Return a JSON outfit object."] };
  const outfit: OutfitSelection = {};
  const seen = new Set<string>();
  for (const [key, raw] of Object.entries(value)) {
    if (!SLOTS.includes(key as Slot)) { errors.push(`Unknown slot: ${key}.`); continue; }
    const slot = key as Slot;
    const ids = slot === "accessories" ? raw : [raw];
    if (!Array.isArray(ids) || ids.length === 0 || (slot === "accessories" && ids.length > MAX_ACCESSORIES)) {
      errors.push(`${slot} must contain ${slot === "accessories" ? `1-${MAX_ACCESSORIES} item IDs in an array` : "one item ID"}.`); continue;
    }
    for (const id of ids) {
      if (typeof id !== "string" || !id) { errors.push(`${slot} contains an invalid ID.`); continue; }
      if (seen.has(id)) errors.push(`Item ${id} appears more than once.`);
      seen.add(id);
      if (!candidates[slot].some(item => item.id === id)) errors.push(`Item ${id} is not an eligible ${slot} candidate (missing or wrong category).`);
    }
    if (slot === "accessories") outfit.accessories = ids;
    else if (typeof raw === "string") outfit[slot] = raw;
  }
  if (outfit.fullBody) {
    if (outfit.top || outfit.bottom) errors.push("Use either fullBody or top and bottom, not both.");
  } else if (!outfit.top || !outfit.bottom) errors.push("A top and bottom, or a fullBody item, are required.");
  if (!errors.length && previous.has(outfitSignature(outfit))) errors.push("This exact set of items was already shown. Choose a different outfit.");
  return errors.length ? { errors } : { outfit, errors };
}

// Lazy enumeration stops at the first unseen complete outfit. No random retry
// loop: even a closet with only one remaining combination is handled correctly.
export function ruleBasedOutfit(candidates: Candidates, previous: Set<string>): OutfitSelection | null {
  function* bases(): Generator<OutfitSelection> {
    for (const top of candidates.top) for (const bottom of candidates.bottom) yield { top: top.id, bottom: bottom.id };
    for (const item of candidates.fullBody) yield { fullBody: item.id };
  }
  function* accessories(start = 0, chosen: string[] = []): Generator<string[]> {
    yield chosen;
    if (chosen.length === MAX_ACCESSORIES) return;
    for (let index = start; index < candidates.accessories.length; index++) {
      yield* accessories(index + 1, [...chosen, candidates.accessories[index]!.id]);
    }
  }
  for (const base of bases()) {
    for (const shoes of [...candidates.shoes.map(item => item.id), undefined]) {
      for (const outerwear of [...candidates.outerwear.map(item => item.id), undefined]) {
        for (const extra of accessories()) {
          const outfit = { ...base, ...(shoes && { shoes }), ...(outerwear && { outerwear }), ...(extra.length && { accessories: extra }) };
          const validated = validateOutfit(outfit, candidates, previous);
          if (validated.outfit) return validated.outfit;
        }
      }
    }
  }
  return null;
}
