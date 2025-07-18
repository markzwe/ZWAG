import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";

const VerifyEmail = ({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const handleVerification = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Verification incomplete. Please try again.");
        console.log("Attempt: ", JSON.stringify(attempt, null, 2));
      }
    } catch (err: any) {
      Alert.alert(
        "Verification Failed",
        err?.errors?.[0]?.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the code sent to {email}</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Enter verification code"
        keyboardType="number-pad"
        style={styles.input}
      />
      <TouchableOpacity
        style={[
          styles.button,
          (loading || code.length === 0) && styles.buttonDisabled,
        ]}
        onPress={handleVerification}
        disabled={loading || code.length === 0}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Verify Email"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: COLORS.pureWhite,
  },
  title: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: "center",
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: COLORS.offWhite,
  },
  button: {
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  buttonText: {
    color: COLORS.pureWhite,
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default VerifyEmail;
