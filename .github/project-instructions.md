# ZWAG - AI-Powered Personal Stylist App

## Architecture Overview

**ZWAG** is an iOS-first React Native app using Expo Router with a serverless Convex backend. Users upload clothing photos (processed with Apple VisionKit for background removal), which are stored and analyzed by AI to generate personalized outfit recommendations.

### Core Tech Stack

- **Frontend**: React Native + Expo Router (file-based routing)
- **Backend**: Convex (serverless functions + real-time database)
- **AI**: OpenAI GPT-4 for outfit generation, VisionKit for background removal
- **Graphics**: React Native Skia for outfit visualization
- **Auth**: Clerk for authentication with Google/Apple SSO

## Key Architectural Patterns

### Database Schema (Convex)

The schema (`convex/schema.ts`) defines three main tables:

- `users`: Clerk authentication + style preferences
- `items`: Individual clothing pieces with AI-generated metadata
- `outfits`: Saved outfit combinations (references to item IDs)

Items have rich metadata: `category`, `subcategory`, `style[]`, `color`, `caption`, `brand`, plus `embedding` vectors for similarity search.

### Navigation Structure (Expo Router)

```
app/
├── (auth)/          # Sign-in/up flows with Clerk
├── (tabs)/          # Main app with bottom tabs
├── onBoardingScreens/
└── screens/         # Feature-specific screens
```

Auth flow: Unauthenticated users → `onBoardingScreens/welcome` → auth screens → `(tabs)` main app.

### AI Outfit Generation Pipeline

1. **Image Upload**: Users photograph clothing → VisionKit removes background
2. **AI Analysis**: Items get AI-generated captions and metadata via `convex/generateItemData.ts`
3. **Outfit Generation**: `convex/generateOutfits.ts` sends filtered wardrobe + context to GPT-4
4. **Visualization**: React Native Skia renders outfit combinations in `components/GeneratedOutfitsCanvas.tsx`

### Custom Expo Module: VisionKit Background Removal

Located in `modules/expo-visionKitBgRemover/`, this bridges iOS VisionKit to React Native:

- Swift implementation in `ios/BgRemoverView.swift` handles VisionKit processing
- TypeScript interface in `src/BgRemoverView.tsx` exposes to React Native
- **Critical**: iOS 16+ only, requires proper error handling for unsupported devices

## Development Workflows

### Running the App

```bash
npx expo start          # Development server
npx expo run:ios        # iOS simulator
npx expo run:android    # Android (limited VisionKit support)
```

### Convex Development

```bash
npx convex dev          # Start Convex backend
npx convex dashboard    # View database/functions
```

### Key Environment Variables

- `CONVEX_DEPLOYMENT`: Convex backend URL
- `CONVEX_OPENAI_API_KEY`: For GPT-4 outfit generation
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication

## Performance & Caching Patterns

### Outfit Caching System

The app implements sophisticated caching in `hooks/useCachedOutfits.ts` and `utils/cacheManager.ts`:

- 5-minute TTL cache for outfit lists
- Cache invalidation after mutations (delete/save)
- Development cache stats via `components/CacheStatsIndicator.tsx`

### Skia Canvas Optimization

Outfit rendering uses memoized components:

- `components/MemoizedOutfitCanvas.tsx` prevents unnecessary re-renders
- Canvas dimensions: 350x500px with proper clipping
- Image loading handled by Expo Image with optimization

## Integration Points

### Convex Functions Pattern

- **Queries**: Real-time data fetching (e.g., `api.items.getItems`)
- **Mutations**: Database modifications (e.g., `api.outfits.saveOutfit`)
- **Actions**: External API calls (e.g., `api.generateOutfits.analyzeOutfit`)

All functions use `getAuthenticatedUser()` for security - never trust client data.

### AI Prompt Engineering

The system uses structured prompts in `config/gptPrompt.ts`:

- Context includes occasion, weather, preferred items
- Returns structured JSON with item IDs for outfit components
- Handles missing categories gracefully (shoes/outerwear optional)

### State Management

Uses Convex's built-in reactivity with custom hooks:

- `useAppDataLoading()` manages app initialization
- `useCachedOutfits()` provides cached outfit data
- React Query patterns with Convex's `useQuery`/`useMutation`

## Project-Specific Conventions

### File Organization

- Components use default exports with descriptive names
- Convex functions grouped by domain (`items.ts`, `outfits.ts`, `users.ts`)
- Modals in dedicated `/modals` directory
- Constants centralized in `/constants/theme.ts`

### Error Handling

- Graceful degradation for VisionKit unavailability
- Network timeouts with user feedback
- Cache fallbacks when queries fail

### Type Safety

- Convex generates TypeScript types in `_generated/`
- Strict typing for outfit item structures
- ID types enforced: `Id<"items">` vs `Id<"outfits">`

## Common Gotchas

1. **VisionKit iOS 16+ Requirement**: Always check availability before using
2. **Outfit Item IDs**: GPT sometimes returns invalid IDs - validate against database
3. **Skia Canvas Memory**: Large images can cause crashes - optimize with Expo Image
4. **Cache Invalidation**: Manual invalidation required after mutations
5. **Clerk Auth**: Handle loading states properly - auth status changes async

## Development Notes

- Use `__DEV__` flag for development-only features (cache stats, debug logs)
- Outfit generation can be slow - always show loading states
- Test background removal with various image types/lighting
- Monitor Convex function execution times in dashboard
