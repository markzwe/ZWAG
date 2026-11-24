import { COLORS } from "@/constants/theme";
import PrivacyModal from "@/modals/PrivacyModal";
import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// COMMENTED OUT FOR V1 - SSO ONLY
// import VerifyEmail from "./verify-email";

export default function SignUpScreen() {
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  // COMMENTED OUT FOR V1 - SSO ONLY
  /*
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showEmailForm, setShowEmailForm] = React.useState(false);

  const handleEmailSignUp = () => {
    setShowEmailForm(true);
  };
  */

  const router = useRouter();

  // Google sign up handler using startSSOFlow
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });

        router.replace("/");
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apple sign up handler using startSSOFlow
  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_apple",
      });
      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });

        router.replace("/");
      }
    } catch (error) {
      console.error("Apple sign-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // COMMENTED OUT FOR V1 - SSO ONLY
  /*
  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!emailAddress || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (error) {
      console.log("Raw error:", JSON.stringify(error, null, 2));

      // Safe error extraction
      const errorObj = JSON.parse(JSON.stringify(error));
      const firstError = errorObj?.errors?.[0];

      if (firstError?.longMessage) {
        Alert.alert("Error", firstError.longMessage);
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <VerifyEmail
        email={emailAddress}
        onBack={() => setPendingVerification(false)}
      />
    );
  }
  */

  // Handle submission of verification form
  // const onVerifyPress = async () => {
  //   if (!isLoaded) return;

  //   try {
  //     const signUpAttempt = await signUp.attemptEmailAddressVerification({
  //       code,
  //     });

  //     if (signUpAttempt.status === "complete") {
  //       await setActive({ session: signUpAttempt.createdSessionId });
  //       router.replace("/(tabs)");
  //     } else {
  //       console.error(JSON.stringify(signUpAttempt, null, 2));
  //     }
  //   } catch (err) {
  //     console.error(JSON.stringify(err, null, 2));
  //   }
  // };

  // if (pendingVerification) {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.title}>Verify your email</Text>
  //       <TextInput
  //         value={code}
  //         placeholder="Enter your verification code"
  //         onChangeText={setCode}
  //         style={styles.input}
  //         keyboardType="number-pad"
  //       />
  //       <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
  //         <Text style={styles.buttonText}>Verify</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={64}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/ZWAG-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>
          Create your account to start styling
        </Text>

        {/* Social Sign Up Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Google Login Button */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            activeOpacity={0.8}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.mediumGray} />
            ) : (
              <>
                <Ionicons
                  name="logo-google"
                  size={20}
                  color="#4285F4"
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.googleText]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* APPLE SIGN UP */}
          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              activeOpacity={0.8}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.mediumGray} />
              ) : (
                <>
                  <Ionicons
                    name="logo-apple"
                    size={20}
                    color={COLORS.pureWhite}
                    style={styles.buttonIcon}
                  />
                  <Text style={[styles.buttonText, styles.appleText]}>
                    Continue with Apple
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* COMMENTED OUT FOR V1 - SSO ONLY */}
          {/* Email Sign Up Button */}
          {/*
          {!showEmailForm && (
            <TouchableOpacity
              style={[styles.socialButton, styles.emailButton]}
              activeOpacity={0.8}
              onPress={handleEmailSignUp}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textPrimary}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.emailText]}>
                Sign up with Email
              </Text>
            </TouchableOpacity>
          )}
          */}
        </View>

        {/* COMMENTED OUT FOR V1 - SSO ONLY */}
        {/* Email Sign Up Form - Only show when button is pressed */}
        {/*
        {showEmailForm && (
          <>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              onChangeText={setEmailAddress}
              style={styles.input}
              keyboardType="email-address"
            />
            <TextInput
              value={password}
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
              <Text
                style={[
                  styles.buttonText,
                  { color: COLORS.pureWhite, fontWeight: "bold" },
                ]}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </>
        )}
        */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Text
            style={styles.linkText}
            onPress={() => router.push("/onBordingScreens/welcome")}
          >
            Log in
          </Text>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsFooter}>
          <Text style={styles.termsText}>
            <Text
              style={styles.termsLink}
              onPress={() => setPrivacyModalVisible(true)}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
          <PrivacyModal
                  visible={privacyModalVisible}
                  onClose={() => {
                    setPrivacyModalVisible(false);
                  }}
                />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: COLORS.pureWhite,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 140,
    height: 70,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "400",
  },
  buttonsContainer: {
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: COLORS.pureWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appleButton: {
    backgroundColor: COLORS.black,
  },
  emailButton: {
    backgroundColor: COLORS.pureWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonIcon: {
    marginRight: 12,
  },
  googleText: {
    color: COLORS.textPrimary,
  },
  appleText: {
    color: COLORS.pureWhite,
  },
  emailText: {
    color: COLORS.textPrimary,
  },
  socialButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  orText: {
    textAlign: "center",
    marginVertical: 16,
    color: COLORS.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: COLORS.offWhite,
  },
  button: {
    backgroundColor: COLORS.darkGray,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  linkText: {
    color: COLORS.darkGray,
    marginLeft: 6,
    fontWeight: "bold",
  },
  termsFooter: {
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 12,
  },
  termsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  termsLink: {
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
});
