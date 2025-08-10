import { COLORS, SPACING } from "@/constants/theme";
import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

export default function SignIn() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    router.back();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_apple",
      });
      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Apple sign-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // COMMENTED OUT FOR V1 - SSO ONLY
  /*
  const handleEmailSignIn = () => {
    router.push("/(auth)/email-sign-in");
  };
  */

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.headerSection}>
                <Text style={styles.title}>Sign in</Text>
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialSection}>
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={handleAppleSignIn}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="logo-apple"
                      size={22}
                      color={COLORS.pureWhite}
                    />
                    <Text
                      style={[styles.socialButtonText, styles.appleButtonText]}
                    >
                      Sign in with Apple
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-google" size={22} />
                  <Text style={styles.socialButtonText}>
                    Sign in with Google
                  </Text>
                </TouchableOpacity>

                {/* COMMENTED OUT FOR V1 - SSO ONLY */}
                {/*
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleEmailSignIn}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color={COLORS.textPrimary}
                  />
                  <Text style={styles.socialButtonText}>
                    Continue with email
                  </Text>
                </TouchableOpacity>
                */}
              </View>

              {/* Terms Footer */}
              <View style={styles.termsFooter}>
                <Text style={styles.termsText}>
                  By continuing you agree to Cal AI's{" "}
                  <Text style={styles.termsLink}>Terms and Conditions</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // More transparent to see welcome screen
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.primaryBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    height: screenHeight * 0.55, // Increase to 55% to ensure terms text is visible
    justifyContent: "space-between", // Distribute content evenly
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: SPACING.md, // Smaller margin
  },
  title: {
    fontSize: 22, // Much smaller header
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  socialSection: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    gap: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appleButton: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  appleButtonText: {
    color: COLORS.pureWhite,
  },
  termsFooter: {
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  termsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: SPACING.sm,
  },
  termsLink: {
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
});
