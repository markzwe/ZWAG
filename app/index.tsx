import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CD964" />
      </View>
    );
  }

  // // Redirect based on authentication status
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/onBordingScreens/welcome" />;
  }
}
