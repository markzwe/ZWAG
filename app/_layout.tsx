import ClerkandConvexProvider from "@/providers/ClerkandConvexProvider";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';

import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 3000,
  fade: true,
});
SplashScreen.hideAsync();


// Set the animation options. This is optional.
// SplashScreen.setOptions is not available in expo-router's SplashScreen.

export default function RootLayout() {
  return (
        <ClerkandConvexProvider>
          <Slot />
        </ClerkandConvexProvider>

  );
}
