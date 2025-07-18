import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function IntialLayout() {
  const auth = useAuth();
  const isLoaded = auth.isLoaded;
  const isSignedIn = auth.isSignedIn;

  const segments = useSegments();
  const router = useRouter();

  // Debug logging
  console.log("Auth Layout Debug:", {
    isLoaded,
    isSignedIn,
    segments: segments[0],
    inAuthScreen: segments[0] === "(auth)",
  });

  useEffect(() => {
    if (!isLoaded) {
      console.log("Auth not loaded yet, waiting...");
      return;
    }

    const inAuthScreen = segments[0] === "(auth)";
    console.log("Auth effect triggered:", {
      isSignedIn,
      inAuthScreen,
      segments: segments[0],
    });

    // If user is signed in and they're in the auth screens, redirect to main app
    if (isSignedIn && inAuthScreen) {
      console.log("User is signed in and in auth screen, redirecting to tabs");
      router.replace("/(tabs)");
    }
    // Note: We don't redirect unsigned users away from auth screens here
    // because they might be in the middle of signing up/signing in
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) {
    console.log("Auth not loaded, returning null");
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
