import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountStatusScreen() {
  const { status, loading, signedIn } = useAccountStatus();
  const { signOut } = useAuth();
  const prepareProfile = useMutation(api.users.prepareMyProfile);
  const { requesting, requestDeletion } = useDeleteAccount();

  useEffect(() => {
    if (status && !status.profileReady && !status.deleted) {
      void prepareProfile({}).catch(() => {});
    }
  }, [prepareProfile, status]);

  if (!loading && (!signedIn || status?.canUseApp)) return <Redirect href="/" />;
  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator accessibilityLabel="Checking account status" /> : status?.deleted ? (
          <Text style={styles.title}>Account deleted</Text>
        ) : status?.deleting ? (
          <>
            <Text style={styles.title}>Account deletion requested</Text>
            <Text style={styles.text}>ZWAG is removing your data. You can sign out while this finishes.</Text>
            <Button title={status.deletionFailed ? "Retry deletion" : "Check deletion and retry"} disabled={requesting}
              onPress={() => void requestDeletion()} />
          </>
        ) : (
          <>
            <Text style={styles.title}>Setting up your account</Text>
            <Text style={styles.text}>Your closet will open once setup finishes.</Text>
            <Button title="Retry setup" onPress={() => void prepareProfile({}).catch(() =>
              Alert.alert("Setup could not finish", "Check your connection and try again."))} />
          </>
        )}
        {signedIn && <Button title="Sign out" onPress={() => void signOut().catch(() =>
          Alert.alert("Could not sign out", "Check your connection and try again."))} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.pureWhite },
  content: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.textPrimary },
  text: { fontSize: 16, color: COLORS.textPrimary },
});
