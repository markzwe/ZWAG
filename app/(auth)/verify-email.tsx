// COMMENTED OUT FOR V1 - SSO ONLY
/*
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useStylePreferences } from "@/providers/StylePreferencesProvider";
import { useSignUp } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const { preferences, clearPreferences } = useStylePreferences();
  const updateStylePreferences = useMutation(api.users.updateStylePreferences);

  // Helper function to save style preferences after authentication
  const saveStylePreferences = async () => {
    if (preferences) {
      try {
        // Wait a moment for authentication to fully propagate
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await updateStylePreferences({
          stylePreferences: preferences.styles,
          favoriteColors: preferences.colors,
          height: preferences.height,
          weight: preferences.weight,
          fitPreference: preferences.fit,
          avoidClothing: preferences.avoidClothing,
          preferredOccasions: preferences.occasions,
          preferredBrands: preferences.brands,
          seasonalOutfits: preferences.seasonalOutfits,
        });
        clearPreferences(); // Clear from context after saving
        console.log("Style preferences saved successfully");
      } catch (error) {
        console.error("Failed to save style preferences:", error);
        // Retry once after another delay
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await updateStylePreferences({
            stylePreferences: preferences.styles,
            favoriteColors: preferences.colors,
            height: preferences.height,
            weight: preferences.weight,
            fitPreference: preferences.fit,
            avoidClothing: preferences.avoidClothing,
            preferredOccasions: preferences.occasions,
            preferredBrands: preferences.brands,
            seasonalOutfits: preferences.seasonalOutfits,
          });
          clearPreferences();
          console.log("Style preferences saved successfully on retry");
        } catch (retryError) {
          console.error(
            "Failed to save style preferences on retry:",
            retryError
          );
          // Don't block the user flow if preferences fail to save
        }
      }
    }
  };

  const handleVerification = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        await saveStylePreferences(); // Save preferences after authentication
        router.replace("/onBordingScreens/payWall");
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
*/

// Placeholder component for V1 - Email verification disabled
import React from "react";
import { Text, View } from "react-native";

const VerifyEmail = ({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Email verification temporarily disabled for V1</Text>
      <Text>Please use Google or Apple sign-in instead</Text>
    </View>
  );
};

export default VerifyEmail;
