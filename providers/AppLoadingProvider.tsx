import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import * as SplashScreen from "expo-splash-screen";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AppLoadingContextType {
  isAppReady: boolean;
  loadingProgress: number;
  loadingStatus: string;
}

const AppLoadingContext = createContext<AppLoadingContextType>({
  isAppReady: false,
  loadingProgress: 0,
  loadingStatus: "Initializing...",
});

export const useAppLoading = () => useContext(AppLoadingContext);

interface AppLoadingProviderProps {
  children: React.ReactNode;
}

export function AppLoadingProvider({ children }: AppLoadingProviderProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");

  // Query essential data that the app needs to function
  const outfits = useQuery(api.outfits.getOutfits);
  const imageUrls = useQuery(api.items.getPreviewImageByCategory);
  const itemCounts = useQuery(api.items.countItemsByCategory);

  useEffect(() => {
    async function prepareApp() {
      try {
        let progress = 0;

        // Check if we have user authentication (handled by Clerk)
        setLoadingStatus("Checking authentication...");
        setLoadingProgress(25);
        progress = 25;

        // Wait for essential queries to complete
        if (outfits !== undefined) {
          setLoadingStatus("Loading your outfits...");
          setLoadingProgress(50);
          progress = 50;
        }

        if (imageUrls !== undefined) {
          setLoadingStatus("Loading closet images...");
          setLoadingProgress(75);
          progress = 75;
        }

        if (itemCounts !== undefined) {
          setLoadingStatus("Finalizing setup...");
          setLoadingProgress(90);
          progress = 90;
        }

        // All essential data is loaded
        if (
          outfits !== undefined &&
          imageUrls !== undefined &&
          itemCounts !== undefined
        ) {
          setLoadingStatus("Ready!");
          setLoadingProgress(100);

          // Small delay for smooth transition
          await new Promise((resolve) => setTimeout(resolve, 500));

          setIsAppReady(true);
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error("Error during app initialization:", error);
        // Even if there's an error, we should eventually hide the splash screen
        setTimeout(async () => {
          setIsAppReady(true);
          await SplashScreen.hideAsync();
        }, 5000); // Fallback timeout after 5 seconds
      }
    }

    prepareApp();
  }, [outfits, imageUrls, itemCounts]);

  return (
    <AppLoadingContext.Provider
      value={{
        isAppReady,
        loadingProgress,
        loadingStatus,
      }}
    >
      {children}
    </AppLoadingContext.Provider>
  );
}
