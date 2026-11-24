import { useAccountStatus } from "@/hooks/useAccountStatus";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { status, signedIn, loading } = useAccountStatus();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator accessibilityLabel="Loading ZWAG" />
      </View>
    );
  }
  if (!signedIn) return <Redirect href="/onBordingScreens/welcome" />;
  return <Redirect href={status?.canUseApp ? "/(tabs)" : "/account-status"} />;
}
