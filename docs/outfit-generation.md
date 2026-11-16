# Outfit generation

`generateOutfits:analyzeOutfit` reads the authenticated user's closet through an
internal query. Client-supplied wardrobe records are not accepted. The shared
rules in `lib/outfitRules.ts` normalize category names and build slot candidates.
Cold weather excludes shorts, tanks, sandals, rompers and swimwear; hot/warm
weather excludes parkas, puffers, down/winter/heavy coats and thermals. These are
explicit garment-type rules, not temperature/fabric predictions from captions.

Only eligible candidates, preferred eligible IDs, context and previously shown
item sets go to the model. A strict validator rejects nonexistent/ineligible IDs,
wrong categories, duplicate IDs, unknown slots and incomplete outfits. A full-body
item replaces both top and bottom. Accessories are an array of up to five IDs.
Malformed or invalid output gets one repair attempt containing the errors. SDK
retries are disabled. Two invalid responses, or a provider error, use a simple
local selection validated by the same rules. No complete unseen combination
means an actionable error, never an incomplete or recycled outfit.

The screen records an accepted suggestion immediately before displaying it.
`outfitHistory` stores the user, slots, item IDs, canonical item-set signature,
context, source (`ai` or `rules`) and display timestamp. All recorded sets are
excluded from future results, regardless of accessory order. The mutation
revalidates ownership/weather and rejects repeats atomically, including requests
from other devices. A generation abandoned before acceptance isn't recorded.

`outfitFeedback` stores the user, history ID, immutable item-ID snapshot, action
(`save`, `dislike`, `try_another`) and timestamp. Distinct clicks produce distinct
rows; replaying the same event ID is idempotent. Saving an outfit and its feedback
row happens in one mutation. Both the generated canvas and saved cards support
full-body garments and multiple accessories.

Run `npm test` for synthetic-data regression tests. They do not read wardrobe
records or spend API credits. Deploy schema/functions to the development backend
with `npx convex dev`; this feature does not require a native rebuild.
