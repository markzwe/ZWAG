import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CD964" />
      </View>
    );
  }

  // // Redirect based on authentication status
  if (isSignedIn && user?.unsafeMetadata?.hasCompletedOnboarding) {
    console.log("User has completed onboarding, redirecting to main app.");
    return <Redirect href="/(tabs)" />;
  } else {
    console.log("User not signed in or onboarding incomplete, redirecting to welcome.");
    return <Redirect href="/onBordingScreens/welcome" />;
  }
}
