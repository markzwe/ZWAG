import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

/**
 * Hook to track when essential app data is loaded
 * Only hides splash screen when core data is ready
 */
export function useAppDataLoading() {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [isAppReady, setIsAppReady] = useState(false);

  // Only fetch data if user is signed in
  const outfits = useQuery(api.outfits.getOutfits, isSignedIn ? {} : "skip");
  const items = useQuery(api.items.getPreviewImageByCategory, isSignedIn ? {} : "skip");
  const itemCounts = useQuery(api.items.countItemsByCategory, isSignedIn ? {} : "skip");

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for user authentication to load
        if (!isUserLoaded) return;

        // If user is not signed in, app is ready (will show auth screens)
        if (!isSignedIn) {
          setIsAppReady(true);
          await SplashScreen.hideAsync();
          return;
        }

        // If user is signed in, wait for essential data to load
        const isDataLoaded = outfits !== undefined && 
                            items !== undefined && 
                            itemCounts !== undefined;

        if (isDataLoaded && !isAppReady) {
          setIsAppReady(true);
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.warn('Error preparing app:', error);
        // Hide splash screen even on error to prevent infinite loading
        setIsAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [isUserLoaded, isSignedIn, outfits, items, itemCounts, isAppReady]);

  return {
    isAppReady,
    isLoading: !isAppReady,
  };
}
