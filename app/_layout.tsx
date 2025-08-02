import ClerkandConvexProvider from "@/providers/ClerkandConvexProvider";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React from "react";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ClerkandConvexProvider>
      <Slot />
    </ClerkandConvexProvider>
  );
}
