import { BORDER_RADIUS, COLORS, SPACING } from "@/constants/theme";
import PrivacyModal from "@/modals/PrivacyModal";
import { useAuth, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

export default function Welcome() {
  const { isLoaded, isSignedIn } = useAuth();
  const { startSSOFlow } = useSSO();
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  // Modal handlers
  const handleOpenSignIn = () => {
    setIsSignInModalVisible(true);
  };

  const handleCloseSignIn = () => {
    setIsSignInModalVisible(false);
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/");
  }, [isLoaded, isSignedIn]);

  const handleSocialSSO = async (strategy: "oauth_google" | "oauth_apple") => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });

      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });
      }

    } catch (err) {
      console.error(`${strategy} sign-in error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.64)",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.pureWhite} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo/Brand Section */}
      <View style={styles.brandSection}>
        <View style={styles.logoPlaceholder}>
          <Image
            source={require("@/assets/images/ZWAG-header.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
      </View>

      {/* Welcome Content */}
      <View style={styles.contentSection}>
        <Text style={styles.valueTitle}>Stop overthinking</Text>
        <Text style={styles.valueSubtitle}>what to wear</Text>

        <Text style={styles.mainMessage}>
          Save your clothes and get outfit ideas for what you own.
        </Text>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitText}>
            • Get outfit suggestions from your closet
          </Text>
          <Text style={styles.benefitText}>• No fashion knowledge needed</Text>
          <Text style={styles.benefitText}>• Perfect for busy mornings</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/sign-up")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleOpenSignIn}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account?{" "}
            <Text style={styles.signInText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isSignInModalVisible}
        transparent={true}
        animationType="slide"
        presentationStyle="overFullScreen"
        // style={{backgroundColor: "rgba(0, 0, 0, 0.3)"}}
      >
        <TouchableWithoutFeedback onPress={handleCloseSignIn}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.headerSection}>
                  <Text style={styles.modalTitle}>Sign in</Text>
                  <TouchableOpacity onPress={handleCloseSignIn}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.socialSection}>
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      disabled={isLoading}
                      onPress={() => handleSocialSSO("oauth_apple")}
                      style={[styles.socialButton, styles.appleButton]}
                    >
                      <Ionicons
                        name="logo-apple"
                        size={22}
                        color={COLORS.pureWhite}
                      />
                      <Text
                        style={[
                          styles.socialButtonText,
                          styles.appleButtonText,
                        ]}
                      >
                        Sign in with Apple
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    disabled={isLoading}
                    onPress={() => handleSocialSSO("oauth_google")}
                    style={styles.socialButton}
                  >
                    <Ionicons name="logo-google" size={22} />
                    <Text style={styles.socialButtonText}>
                      Sign in with Google
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.termsFooter}>
                  <Text style={styles.termsText}>
                    <Text style={styles.termsLink} onPress = { () => setPrivacyModalVisible(true)}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        <PrivacyModal
          visible={privacyModalVisible}
          onClose={() => {
            setPrivacyModalVisible(false);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryBackground,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  brandSection: {
    alignItems: "center",
  },
  logoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 36,
    fontFamily: "",
    fontWeight: "700",
    color: COLORS.pureWhite,
    letterSpacing: 2,
  },
  logo: {
    width: 100,
    height: 100,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  contentSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: 32,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
    fontWeight: "400",
  },
  buttonSection: {
    gap: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.darkGray,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.apple,
    alignItems: "center",
    shadowColor: COLORS.textPrimary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
  },
  signInText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  valueTitle: {
    fontSize: 32,
    fontWeight: "300",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  valueSubtitle: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  mainMessage: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 26,
    fontWeight: "400",
  },
  benefitsContainer: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  benefitText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    fontWeight: "400",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.primaryBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    height: screenHeight * 0.49,
    justifyContent: "space-between",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    flex: 1,
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
