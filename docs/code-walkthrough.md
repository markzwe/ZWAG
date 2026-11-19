# ZWAG code walkthrough

This guide describes the source as inspected on November 17, 2026. It follows the
active code paths rather than treating every filename as a completed feature.

## 1. Where code runs

| Place | Files | Responsibility |
| --- | --- | --- |
| Phone: React Native JavaScript | `app/`, `components/`, `hooks/`, `providers/` | Screens, local state, navigation, and requests to the backend |
| Convex server | `convex/` | Authentication checks, database/storage access, model requests, history, and feedback |
| Phone: native iOS | `ios/`, `modules/vision-bg-remover/ios/` | iOS startup/window lifecycle and local photo background removal |
| OpenAI's servers | Called from `convex/stylistChat.ts` and `convex/generateOutfits.ts` | Chat interpretation and choosing outfits from supplied candidates |

A `.tsx` file can contain both React UI and ordinary functions. A `.ts` file can
contain ordinary logic, backend functions, or types. The extension alone does not
tell you which machine executes it. Imports and where a function is called matter.

## 2. Read these folders as responsibilities

| Folder/file | Meaning in this project |
| --- | --- |
| `package.json` | Entry point (`expo-router/entry`), scripts, installed packages |
| `app/` | Expo Router screens and layouts; file paths determine route names |
| `components/` | UI pieces used by screens; a component is not automatically a route |
| `hooks/` | Reusable React behavior (`useAppDataLoading`, outfit caching, image rotation) |
| `providers/` | Shared services/state surrounding many screens |
| `contexts/` | Other React context definitions, including onboarding data |
| `convex/schema.ts` | Database table shapes and indexes; not a collection of actual records |
| `convex/*.ts` | Backend entry points and helpers |
| `convex/_generated/` | Generated API references and types; normally regenerated, not hand-edited |
| `lib/outfitRules.ts` | Ordinary deterministic outfit logic, used by the backend |
| `config/gptPrompt.ts` | Builds the outfit-generation prompt string |
| `constants/` | Shared colors, category names, routes, and settings |
| `types/` | TypeScript descriptions of data; types do not create runtime records |
| `modals/` | Reusable category/color/brand selectors, policy dialogs, item details |
| `modules/vision-bg-remover/` | JavaScript-to-native bridge plus platform implementations |
| `scripts/` | Development compatibility scripts and automated tests |
| `app.json`, `eas.json` | App identity/platform settings and build profiles |
| `metro.config.js` | JavaScript bundler configuration, including Convex stack-path correction |

`@/components/Header` means the `components/Header` module inside the ZWAG project.
The path alias is configured in `tsconfig.json` and supported by Expo's tooling.

## 3. The React concepts you keep seeing

- A **component** is a function returning JSX describing what should be displayed.
  React calls it again when its state/subscriptions change.
- **Props** are inputs supplied by a parent component.
- **State** (`useState`) is local UI memory. Calling its setter schedules a render;
  it does not automatically save anything to the database.
- A **ref** (`useRef`) retains a value without triggering a render. Chat uses one
  to block duplicate taps before React updates the disabled button state.
- An **effect** (`useEffect`) runs setup after rendering and can return cleanup.
  For example, the generation screen starts its initial request from an effect.
- A **callback prop** gives a child a function to call. The outfit card receives
  `onSave`; it calls the parent screen's save handler when its button is pressed.
- `async` functions return promises. `await` waits for a result while the app can
  continue rendering loading indicators.
- `router.push(...)` navigates to another screen. It does not itself generate an
  outfit, call OpenAI, or write a database record.

## 4. How frontend code calls Convex

```ts
const chat = useAction(api.stylistChat.sendMessage);
const result = await chat({ messages, context });
```

The first line obtains a callable backend reference. The second line sends the
request. Read the reference as:

```text
api.stylistChat.sendMessage
    └ file: convex/stylistChat.ts
                   └ exported backend function: sendMessage
```

These are three different operations:

| Hook | What it does | Example |
| --- | --- | --- |
| `useQuery(...)` | Subscribes to backend data and causes a render when results change | `api.items.countItemsByCategory` |
| `useMutation(...)` | Gives you a function that writes database/storage-related state when called | `api.outfits.saveOutfit` |
| `useAction(...)` | Gives you a function for backend work that can call external services | `api.stylistChat.sendMessage` |

Queries initially can return `undefined` while loading. `"skip"` prevents a query
subscription when prerequisites such as sign-in are absent.

Inside a backend handler:

- `ctx.auth.getUserIdentity()` gets the authenticated identity.
- `ctx.db` reads/writes database documents in queries/mutations.
- `ctx.storage` handles uploaded image files.
- `ctx.runQuery(...)` calls a query from server code.
- `ctx.runAction(...)` calls an action from server code.
- `internal.outfitHistory.generationContext` is a backend-only reference. The
  phone cannot call an `internalQuery` directly.

`convex/_generated/api.js` supplies references, not the implementation of every
backend function. Follow the filename/function name to find the implementation.

## 5. Startup: opening ZWAG

```text
package.json: main = expo-router/entry
  iOS AppDelegate.swift / SceneDelegate create the scene-backed React window
  app/_layout.tsx: RootLayout
    ClerkandConvexProvider
      ClerkProvider: sign-in session + secure token cache
      ConvexProviderWithClerk: authenticate backend requests with Clerk
      ClerkLoaded: wait for Clerk initialization
      AppDataLoader -> hooks/useAppDataLoading.ts
    StylePreferencesProvider: temporary onboarding preference state
    Slot: render the active route
  app/index.tsx: Index
    wait for authentication
    completed onboarding -> /(tabs)
    otherwise -> /onBordingScreens/welcome
```

`useAppDataLoading()` subscribes to saved outfits, closet previews, and category
counts for signed-in users. It hides the splash screen when its prerequisites
are ready. For signed-out users, it hides the splash after user loading finishes.

`app/(tabs)/_layout.tsx` defines the three tabs:

| Screen file | Displayed tab |
| --- | --- |
| `app/(tabs)/index.tsx` | Closet |
| `app/(tabs)/recents.tsx` | Fits / saved outfits |
| `app/(tabs)/generateOutfits.tsx` | Generation entry screen |

Parentheses in `(tabs)` and `(auth)` group routes. `_layout.tsx` wraps child routes;
`index.tsx` is the group's initial page. `Slot` renders a child route, while `Tabs`
and `Stack` configure navigation around child routes.

## 6. Authentication and onboarding

`welcome.tsx` uses Clerk hooks and social sign-in. Its effect watches the loaded
user and onboarding metadata to choose the next screen.

`styleQuestionnaire.tsx: handleFinish()` puts preferences in
`StylePreferencesProvider`, then either saves them through
`api.users.updateStylePreferences` for a signed-in user or navigates to sign-up.
`app/(auth)/sign-up.tsx` reads those temporary preferences during its sign-up flow.

Two user IDs exist:

- Clerk's user ID identifies the login account.
- Convex's `users._id` identifies the corresponding database document.

`convex/users.ts: getAuthenticatedUser(ctx)` gets the Clerk identity, finds the
matching Convex user through the `byClerkId` index, and returns that user document.
Backend item/history functions use its `_id` to scope records to the current user.

`convex/auth.config.ts` configures the Clerk token issuer. `convex/http.ts` receives
signed Clerk webhooks, verifies them with Svix, and calls `users.createUser` or
`users.deleteUserByClerkId` for the relevant account events.

Navigation is not a substitute for authorization. Inspect the backend handler's
identity and ownership checks whenever you want to know who can read/write data.

## 7. Adding one clothing item

```text
Closet tab -> router.push(ROUTES.SCREENS.CLOSET.ADD_ITEM)
  addItem.tsx
    handleImagePicker() / handleOpenCamera()
      Expo ImagePicker -> local photo URI -> selectedImage state
    Continue -> router.push(visionKitRemoval, { imageUri })
  visionKitRemoval.tsx
    renders VisionBgRemoverView with imageUri and event callbacks
  modules/vision-bg-remover/src/VisionBgRemoverView.tsx
    requireNativeView("VisionBgRemover") bridges to native iOS view
  ios/VisionBgRemoverModule.swift (inside that module)
    imageUri prop -> view.loadImage(from:)
  ios/VisionBgRemoverView.swift
    loadImage -> VNGenerateForegroundInstanceMaskRequest
      -> transparent cropped PNG in temporary storage
      -> onProcessingComplete({ processedImageUri })
  visionKitRemoval.tsx
    callback -> router.replace(addedItem, { processedImageUri })
  addedItem.tsx
    user enters category, subcategory, color, style and caption
    Save -> saveToWardrobe()
      generatedUploadUrl() -> convex/items.ts: generatedUploadUrl
      FileSystem.uploadAsync(...) uploads image bytes to that URL
      upload response contains storageId
      createItem(...) -> convex/items.ts: uploadItem
        getAuthenticatedUser -> storage.getUrl -> db.insert("items", ...)
  Closet queries update -> React renders the newly uploaded item
```

The local URI is a file on the phone. The uploaded `storageId` identifies the
persistent Convex storage file. `imageUrl` is the URL used to display it later.
These are related but different values.

Background removal is Apple's Vision inference on the device. It is separate
from GPT outfit selection, and the tested simulator could not run that Vision
inference. The screen offers Retry and Use Original Photo on processing failure.

## 8. Chat: follow one complete function call chain

Start in `app/(tabs)/generateOutfits.tsx`:

```text
Generation tab
  -> app/(tabs)/generateOutfits.tsx re-exports StylistChat
  -> app/screens/generateOutfit/chat.tsx: StylistChat
```

Then press Send in the chat screen:

```text
onPress -> send()
  trims input and creates a user Message
  setMessages(next) -> user bubble renders
  builds a bounded recent conversation
  execute(turn)
    blocks duplicate taps and sets sending=true
    logFeedback(turn.feedback), if this came from a card reaction
    chat(...) from useAction(api.stylistChat.sendMessage)
      NETWORK -> convex/stylistChat.ts: sendMessage.handler
        check authentication and message limits
        OpenAI call #1: interpret the conversation
          general advice -> return reply only
          outfit request -> ctx.runAction(analyzeOutfit)
            detailed generation flow in section 9
        return { reply, context, suggestion? }
    if suggestion exists:
      recordShown(...) -> convex/outfitHistory.ts: recordShown
      attach returned historyId to the suggestion
    setMessages(...assistant reply...) -> reply/card renders
    setContext(...) -> future turns retain occasion/style
    set sending=false
```

Chat's `messages` and `context` state live on the phone. They are sent with each
turn; this is how follow-ups work. No chat transcript database table currently
exists. `newChat()` clears local conversation state, not saved outfits/history.

`lastTurn` preserves a failed request for Retry. A feedback event's ID is retained
so retrying the request does not duplicate the same reaction row.

An outfit request in chat normally makes two model calls: one to understand the
conversation, then one to select clothes. Invalid selection can cause one more
repair call. General advice normally only needs the first call.

## 9. The actual recommender: analyzeOutfit

`convex/generateOutfits.ts: analyzeOutfit.handler` orchestrates the following:

```text
ctx.runQuery(internal.outfitHistory.generationContext)
  getAuthenticatedUser(ctx)
  read this user's items + shown history
closetCandidates(items)
  convert database documents into model-facing clothing metadata
buildCandidates(items, preferred IDs)       [lib/outfitRules.ts]
  normalize categories, deduplicate items, prioritize preferred IDs
outfitSignature(previous outfits)
  create the no-repeat set
ruleBasedOutfit(candidates, previous)
  find a valid unseen fallback before spending on a model request
  none available -> explain that the closet needs more eligible combinations
generateOutfitPrompt(candidates, context)             [config/gptPrompt.ts]
  include only eligible candidates + preferences + previous sets
OpenAI chat.completions.create(...)
  parse the returned JSON
  validateOutfit(parsed, candidates, previous)        [lib/outfitRules.ts]
    valid -> accept
    invalid -> send validation errors and retry once
  still invalid/provider failure -> use the fallback
validate final selection again
return { outfit, source: "ai" | "rules", occasion }
```

Responsibilities in `lib/outfitRules.ts`:

| Function | Purpose |
| --- | --- |
| `categorySlot(category)` | Maps names such as `Tops` to `top` |
| `buildCandidates(...)` | Creates eligible item lists per slot |
| `outfitIds(outfit)` | Extracts the selected garment IDs |
| `outfitSignature(outfit)` | Sorts IDs into an order-independent repeat key |
| `validateOutfit(...)` | Checks existence in eligible candidates, category, uniqueness, completeness and repeats |
| `ruleBasedOutfit(...)` | Finds the first valid unseen combination using deterministic enumeration |

The fallback finds a valid outfit; it is not a learned compatibility scorer.
The generator currently receives item text metadata, not photo pixels or image
embeddings. The stored user preference profile is not automatically read here;
current generation context comes from request arguments and chat instructions.

## 10. Showing, saving, disliking, and asking for another

`components/StylistOutfitCard.tsx` renders a chat outfit. It subscribes to
`api.items.getOutfitItemsFromAi` to resolve the chosen IDs into owned item records
and image URLs. Its button callbacks call functions supplied by `chat.tsx`.

| User action | Frontend chain | Backend writes |
| --- | --- | --- |
| Show accepted result | `execute()` -> `recordShown(...)` -> append card | `outfitHistory` |
| Save card | card `onSave` -> chat `save(message)` -> `saveOutfit(...)` | `outfits` AND `outfitFeedback` in one mutation |
| Not my style | card `onDislike` -> `another(message, "dislike")` -> `send` -> `execute` | feedback row, then another chat/generation request |
| Try another | card `onAnother` -> `another(message, "try_another")` -> `send` -> `execute` | feedback row, then another chat/generation request |

`recordShown` rechecks ownership, item eligibility and exact repeats before
writing. It is called immediately before a card is accepted into the transcript.

`outfits.saveOutfit` uses a history ID, not arbitrary new client-supplied garment
IDs. It verifies the history owner, rechecks the current closet, inserts the saved
outfit, and records save feedback atomically.

`outfitHistory.logFeedback` verifies history ownership and copies its stored item
IDs into the feedback row. Event IDs make retries of the same operation idempotent.

Feedback is being collected. Nothing currently retrains a model automatically
from saves, dislikes, or Try Another clicks.

## 11. Chat entry and saved outfits

The generation tab (`app/(tabs)/generateOutfits.tsx`) renders the chat screen
directly. The quick presets and the old item-selection wizard have been
removed. Outfit selection happens through the chat backend described above.

`GeneratedOutfitsCanvas.tsx` remains in use by the Fits tab to display saved
outfits. It resolves item IDs through the authenticated item query and renders
them with React Native Skia.

The Fits tab (`recents.tsx`) calls `useCachedOutfits()`, which subscribes to
`api.outfits.getOutfits`. It renders `OutfitPreviewCard` entries and a larger canvas
for the selected outfit. Deletion calls `api.outfits.deleteOutfit`.

Shown history and saved outfits are different: an outfit can be shown without
being saved. The Fits tab displays saved outfits, not every history entry.

## 12. Database relationships

These are defined in `convex/schema.ts`:

```text
Clerk account ID
  -> users.clerkId
     users._id
       -> items.userId             owned clothes + uploaded image references
       -> outfits.userId           saved garment selections
       -> outfitHistory.userId     accepted/shown selections and context
       -> outfitFeedback.userId    save/dislike/try_another events

outfitFeedback.historyId -> outfitHistory._id
outfitFeedback.savedOutfitId -> outfits._id  (save events)
```

An outfit stores references such as `{ top: itemId, bottom: anotherItemId }`.
It does not copy the entire photo into the outfit row. Display components fetch
those item records to obtain their image URLs.

`outfitValidators.ts` defines runtime input/output shapes. `types/index.ts` and
`_generated/dataModel.d.ts` describe TypeScript types. The strict business rules
still live in `lib/outfitRules.ts`: a runtime shape validator alone cannot prove
that a top is actually categorized as a top.

## 13. Files that can mislead you

- `convex/generateItemData.ts` is empty. There is no implemented auto-tagger there.
- `items.embedding` exists as an optional schema field, but the inspected upload
  flow does not compute embeddings or train/use an image recommendation scorer.
- `providers/AppLoadingProvider.tsx` exists, but the inspected root layout uses
  `AppDataLoader` inside `ClerkandConvexProvider` instead.
- `OnboardingProvider` is mounted in the onboarding layout, but its
  `useOnboarding()`/`getSmartDefaults()` helpers have no inspected consumers.
  The active questionnaire uses `StylePreferencesProvider`.
- `.disabled` auth files and commented-out implementations are not evidence of an
  active feature. A `.tsx` route with no default component can cause router warnings.
- The old `askOccasion.tsx` route was removed. Custom generation now opens chat.
- UI labels, comments, and README feature lists can lag behind executable code.
  Follow the button handler and backend call to establish actual behavior.

## 14. How to investigate one feature yourself

1. Find the screen and the visible button's `onPress`.
2. Follow the local handler (`send`, `saveToWardrobe`, etc.).
3. Find its hook declaration: `useAction`, `useMutation`, or `useQuery`.
4. Translate `api.fileName.exportName` into `convex/fileName.ts`.
5. Read `args`, then `handler`, then any helper it calls.
6. Look for `ctx.db`, `ctx.storage`, or an external API call to understand effects.
7. Follow the returned value back to a state setter and the JSX that uses it.
8. Read the corresponding test for expected behavior and failure cases.

Example searches from the ZWAG directory:

```sh
rg -n 'onPress|function send|function execute' app/screens/generateOutfit/chat.tsx
rg -n 'api\.|useAction|useMutation|useQuery' app/screens/generateOutfit/chat.tsx
rg -n 'sendMessage|runAction|completions.create' convex/stylistChat.ts
rg -n 'runQuery|buildCandidates|validateOutfit|ruleBasedOutfit' convex/generateOutfits.ts
```

Tests under `scripts/*.test.cjs` use synthetic data and mocked provider responses.
They verify expected rules and call behavior without reading private wardrobe
records or spending model credits. `npm test` runs them.

Start by tracing one chat message through sections 8-10. Then trace one photo
upload through section 7. Those two journeys cover most of the app's architecture.
