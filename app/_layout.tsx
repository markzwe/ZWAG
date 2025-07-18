import ClerkandConvexProvider from "@/providers/ClerkandConvexProvider";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
        <ClerkandConvexProvider>
          <Slot />
        </ClerkandConvexProvider>

  );
}
