import { AI_CONSENT_DISCLOSURE, AI_CONSENT_VERSION } from "@/constants/aiConsent";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Alert, Button, Linking, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { visible: boolean; onClose: () => void; showControls?: boolean };

export default function PrivacyModal({ visible, onClose, showControls }: Props) {
  const { status } = useAccountStatus();
  const setConsent = useMutation(api.users.setAiConsent);
  const [updating, setUpdating] = useState(false);
  const policyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL;

  async function revoke() {
    setUpdating(true);
    try {
      await setConsent({ allowed: false, version: AI_CONSENT_VERSION });
    } catch {
      Alert.alert("Could not turn off AI sharing", "Check your connection and try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>{showControls ? "Privacy & Security" : "Zwag Privacy Policy"}</Text>
          <Button title="Done" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {showControls && (
            <>
              <Text accessibilityRole="header" style={styles.heading}>OpenAI sharing</Text>
              <Text style={styles.text}>{status?.aiConsent ? "Sharing is on." : "Sharing is off. Open the chat to review the request."}</Text>
              {status?.aiConsent && <Button title="Turn off OpenAI sharing" disabled={updating} onPress={() => void revoke()} />}
            </>
          )}
          <Text accessibilityRole="header" style={styles.heading}>Your account and closet</Text>
          <Text style={styles.text}>Clerk handles sign-in with Apple or Google. Zwag stores your account identifier and sign-in email when provided. Convex stores your closet photos and descriptions, preferences, saved outfits, outfit history, and feedback to provide these features.</Text>
          <Text accessibilityRole="header" style={styles.heading}>Sharing in chat</Text>
          <Text style={styles.text}>{AI_CONSENT_DISCLOSURE}</Text>
          <Text style={styles.text}>Zwag asks for permission before sending this data. Your chat transcript is kept on this device. Withdrawing permission stops future OpenAI requests from your account.</Text>
          <Text accessibilityRole="header" style={styles.heading}>Account deletion</Text>
          <Text style={styles.text}>Use Delete Account in the app menu. Zwag removes your account and associated closet, photos, outfits, and feedback. A deletion marker prevents your old account from being recreated by a delayed sign-in event. Devices clear their local transcripts when they receive your deletion status.</Text>
          {policyUrl?.startsWith("https://") && <Button title="Open online privacy policy" onPress={() =>
            void Linking.openURL(policyUrl).catch(() => Alert.alert("Could not open the privacy policy"))} />}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.pureWhite },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  content: { padding: 20, gap: 12 },
  title: { flex: 1, color: COLORS.textPrimary, fontSize: 24, fontWeight: "700" },
  heading: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "600", marginTop: 8 },
  text: { color: COLORS.textPrimary, fontSize: 16, lineHeight: 23 },
});
