import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import VerifyEmail from "./verify-email";
import { COLORS } from "@/constants/theme";

export default function SignUpScreen() {
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = useState(false);

  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Google sign up handler using startSSOFlow
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

  // Apple sign up handler using startSSOFlow
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
        <Text style={styles.title}>Sign up</Text>

        {/* Social Sign Up Buttons */}
        {/* Google Login Button */}
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.pureWhite,
            borderRadius: 20,
            paddingVertical: 18,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            shadowColor: COLORS.black,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
            transform: [{ scale: isLoading ? 0.98 : 1 }],
          }}
          activeOpacity={0.8}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.mediumGray} />
          ) : (
            <View
              style={{
                backgroundColor: COLORS.pureWhite,
                borderRadius: 12,
                padding: 8,
                marginRight: 16,
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="logo-google" size={20} color="#4285F4" />
            </View>
          )}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: COLORS.textPrimary,
              letterSpacing: 0.5,
            }}
          >
            {isLoading ? "  Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {/* APPLE SIGN UP */}
        {Platform.OS === "ios" && (
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.black,
              borderRadius: 20,
              paddingVertical: 18,
              paddingHorizontal: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              shadowColor: COLORS.black,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
              transform: [{ scale: isLoading ? 0.98 : 1 }],
            }}
            activeOpacity={0.8}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.mediumGray} />
            ) : (
              <View
                style={{
                  backgroundColor: COLORS.black,
                  borderRadius: 12,
                  padding: 8,
                  marginRight: 16,
                  shadowColor: COLORS.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons
                  name="logo-apple"
                  size={20}
                  color={COLORS.pureWhite}
                />
              </View>
            )}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: COLORS.pureWhite,
                letterSpacing: 0.5,
              }}
            >
              {isLoading ? "  Signing in..." : "Continue with Apple"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.orText}>or sign up with email</Text>

        {/* Email Sign Up */}
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
          <Text style={styles.buttonText}>
            {loading ? "Signing up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Text
            style={styles.linkText}
            onPress={() => router.replace("/(auth)/sign-in")}
          >
            Log in
          </Text>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: COLORS.textPrimary,
  },
  socialButton: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
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
    color: COLORS.pureWhite,
    fontWeight: "bold",
    fontSize: 16,
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
});
