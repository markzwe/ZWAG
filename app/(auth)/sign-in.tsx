import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { COLORS } from "@/constants/theme";

export default function SignIn() {
  const { startSSOFlow } = useSSO();

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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

  const handleSignIn = async () => {
    if (!emailAddress || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    console.log("=== SIGN IN ATTEMPT ===");
    console.log("Email:", emailAddress);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      console.log("Sign-in attempt result:", {
        status: signInAttempt.status,
        createdSessionId: signInAttempt.createdSessionId,
      });

      if (signInAttempt.status === "complete") {
        console.log("Sign-in complete, setting active session...");
        await setActive({ session: signInAttempt.createdSessionId });
        console.log("Session set active, redirecting to tabs...");
        router.replace("/(tabs)");
      } else {
        console.log(
          "Sign-in not complete:",
          JSON.stringify(signInAttempt, null, 2)
        );
        Alert.alert(
          "Sign-in Incomplete",
          "Please check your email for verification or try again."
        );
      }
    } catch (error: any) {
      console.log("Sign-in error:", JSON.stringify(error, null, 2));

      let errorMessage = "Something went wrong. Please try again.";
      let errorTitle = "Sign-in Failed";

      // Check for specific error types
      if (error?.errors && error.errors.length > 0) {
        const firstError = error.errors[0];

        // Handle password breach error
        if (firstError.code === "form_password_pwned") {
          errorTitle = "Password Security Alert";
          errorMessage =
            "This password has been found in an online data breach. For your account safety, please use a different password.";
        }
        // Handle other specific errors
        else if (firstError.code === "form_identifier_not_found") {
          errorTitle = "Account Not Found";
          errorMessage =
            "No account found with this email address. Please check your email or create a new account.";
        } else if (firstError.code === "form_password_incorrect") {
          errorTitle = "Incorrect Password";
          errorMessage =
            "The password you entered is incorrect. Please try again.";
        } else if (firstError.message) {
          errorMessage = firstError.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
      console.log("=== SIGN IN ATTEMPT END ===");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.success} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Welcome back</Text>

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
              <Ionicons name="logo-apple" size={20} color={COLORS.pureWhite} />
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

      <View style={styles.formContainer}>
        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter your email"
          onChangeText={setEmailAddress}
          style={styles.input}
          keyboardType="email-address"
          editable={!isLoading}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            value={password}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            style={styles.passwordInput}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
            disabled={isLoading}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.mediumGray}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.pureWhite} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Text
          style={styles.linkText}
          onPress={() => router.replace("/(auth)/sign-up")}
        >
          Sign up
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.pureWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.pureWhite,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: COLORS.textSecondary,
  },
  formContainer: {
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: COLORS.offWhite,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 16,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: COLORS.offWhite,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 4,
  },
  button: {
    backgroundColor: COLORS.darkGray,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  buttonText: {
    color: COLORS.pureWhite,
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  linkText: {
    color: COLORS.darkGray,
    fontSize: 14,
    fontWeight: "bold",
  },
});
