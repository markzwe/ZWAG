# ZWAG - AI-Powered Personal Stylist App

**ZWAG** is a production-ready React Native app that uses AI to help users create personalized outfit recommendations from their wardrobe. Built with modern TypeScript, strict coding practices, and scalable architecture.

## 🚀 Features

- **AI-Powered Outfit Generation**: Uses OpenAI GPT-4 to create personalized outfit recommendations
- **Smart Image Processing**: Apple VisionKit integration for automatic background removal (iOS 16+)
- **Real-time Database**: Convex backend with real-time synchronization
- **Advanced Caching**: Intelligent caching system with automatic cleanup and invalidation
- **Type-Safe Architecture**: Strict TypeScript with comprehensive type definitions
- **Reusable UI Components**: Production-ready component library with consistent design
- **Error Handling & Logging**: Comprehensive error boundaries and logging system

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React Native + Expo Router (file-based routing)
- **Backend**: Convex (serverless functions + real-time database)
- **AI**: OpenAI GPT-4 for outfit generation
- **Graphics**: React Native Skia for outfit visualization
- **Auth**: Clerk authentication with Google/Apple SSO
- **Image Processing**: Apple VisionKit for background removal

### Project Structure
```
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication flows
│   ├── (tabs)/            # Main app with bottom tabs
│   ├── onBoardingScreens/ # Onboarding flow
│   └── screens/           # Feature-specific screens
├── components/            # Reusable components
│   └── ui/               # UI component library
├── constants/            # Centralized constants
├── convex/              # Backend functions & schema
├── hooks/               # Custom React hooks
├── providers/           # Context providers
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── modules/             # Custom Expo modules
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- iOS 16+ (for VisionKit features)
- Expo CLI
- Convex CLI

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd ZWAG
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```
   CONVEX_DEPLOYMENT=your-convex-deployment-url
   CONVEX_OPENAI_API_KEY=your-openai-api-key
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
   ```

3. **Start Convex backend**
   ```bash
   npx convex dev
   ```

4. **Start the app**
   ```bash
   npx expo start
   ```

### Development Commands
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Start Convex backend
npx convex dev

# View Convex dashboard
npx convex dashboard

# Type checking
npx tsc --noEmit

# Linting
npx expo lint
```

`npx expo run:ios` (also `npm run ios`) builds and installs the iOS app,
opens Device Hub on Xcode 27, and starts Metro. The project uses Expo SDK 58,
React Native 0.88, and React 19.3. SDK 58 provides Device Hub support and the
scene-based iOS lifecycle directly; the SDK 53 compatibility patches are removed.

Use Node.js 22.13+ on the 22 line or 24.3+ on the 24 line. The native iOS
minimum is 16.4; automatic clothing-background removal requires iOS 17+.
After installing this upgrade, rebuild the development app with
`npx expo run:ios` rather than reopening an SDK 53 binary.

## 📱 Key Features

### AI Outfit Generation Pipeline
1. **Image Upload**: Users photograph clothing items
2. **Background Removal**: VisionKit automatically removes backgrounds (iOS 16+)
3. **AI Analysis**: Items get AI-generated captions and metadata
4. **Outfit Generation**: GPT-4 creates outfit combinations based on context
5. **Visualization**: React Native Skia renders outfit combinations

### Caching System
- **5-minute TTL cache** for outfit lists
- **Automatic cleanup** of expired entries
- **Cache invalidation** after mutations
- **Development cache stats** for monitoring

---

## Tech Stack

- **Frontend:** React Native with Expo (iOS focused)  
- **Backend:** Convex for serverless functions and database  
- **AI Models:**  
  - BLIP or similar for image captioning  
  - OpenAI text embeddings for item vectorization  
  - GPT-4o for outfit generation  
- **Storage:** Cloudinary or AWS S3 for images

---

## Architecture & Workflow


1. **Image Upload:** Users upload clothing photos.  
2. **Captioning & Metadata Extraction:** AI generates descriptive captions and tags.  
3. **Embedding & Storage:** Captions are embedded and stored for similarity search.  
4. **Outfit Generation:** On request, filtered wardrobe items are sent to GPT-4o with style prompts for outfit suggestions.  
5. **Display:** Suggested outfits with images are shown to users.

---

## Cost & Scaling Considerations

- Use metadata filtering and vector search to limit GPT input size.  
- Cache generated outfits to reduce repeated API calls.  
- Offer subscription model to cover AI usage costs.

---

## Future Enhancements

- Android support  
- Social sharing and community features  
- Integration with e-commerce platforms  
- Style trend updates and personalized recommendations

---

## Getting Started

Instructions for setting up the development environment, installing dependencies, and running the app will be added soon.

---

## License

MIT License
---

*Developed by Zwe Htet*
