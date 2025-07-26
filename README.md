# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```
# ZWAG — AI-Powered Personal Stylist App

**Founder:** Zwe Htet  
**Co-founder:** TBD

---

## Project Overview

ZWAG is an iOS-first mobile app designed to help users dress better by leveraging AI-powered outfit suggestions tailored to their personal wardrobe. Users upload photos of their clothing items, which are processed to create a digital wardrobe. The AI analyzes the wardrobe and recommends stylish, personalized outfit combinations based on occasion, mood, and fashion trends.

---

## Key Features

- **Digital Wardrobe Management**  
  Upload multiple photos of clothing items (shirts, pants, shoes, accessories). Backgrounds are automatically removed using Apple’s VisionKit, and items are categorized with descriptive captions and metadata.

- **AI Outfit Suggestions**  
  Uses OpenAI GPT-4o (or fine-tuned models) to generate outfit ideas considering occasion, weather, mood, and style preferences.

- **“Match My Fit” Mode**  
  Select an anchor clothing item and get AI recommendations for matching or contrasting pieces from your wardrobe.

- **Find Clothes from Screenshots (Future)**  
  Upload social media or shopping screenshots; AI will suggest similar items from your wardrobe.

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
