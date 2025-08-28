import {
  IMPERIAL_HEIGHTS,
  IMPERIAL_WEIGHTS,
  METRIC_HEIGHTS,
  METRIC_WEIGHTS,
} from "@/constants/measurements";
import {
  FIT_OPTIONS,
  OCCASION_OPTIONS,
  ONBOARDING_COLOR_OPTIONS,
  STYLE_OPTIONS,
} from "@/constants/preferences";
import { COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useStylePreferences } from "@/providers/StylePreferencesProvider";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface StylePreferences {
  styles: string[];
  colors: string[];
  fit: string;
  avoidClothing: string;
  occasions: string[];
  brands: string;

  seasonalOutfits: boolean;
  height: string;
  weight: string;
  isMetric: boolean;
  referralCode: string;
}

export default function StyleQuestionnaire() {
  const router = useRouter();
  const { user } = useUser();
  const { setPreferences: setStylePrefs } = useStylePreferences();
  const updateStylePreferences = useMutation(api.users.updateStylePreferences);
  const validateInviteCode = useMutation(api.inviteCodes.validateInviteCode);
  const redeemInviteCode = useMutation(api.inviteCodes.redeemInviteCode);
  const { isSignedIn } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteCodeValid, setIsInviteCodeValid] = useState<boolean | null>(
    null
  );
  const [inviteCodeText, setInviteCodeText] = useState<string | null>(null);
  const [isPressedSubmit, setIsPressedSubmit] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [preferences, setPreferences] = useState<StylePreferences>({
    styles: [],
    colors: [],
    fit: "",
    avoidClothing: "",
    occasions: [],
    brands: "",
    seasonalOutfits: false,
    height: "",
    weight: "",
    isMetric: false,
    referralCode: "",
  });

  const totalSteps = 8;

  const handleStyleSelect = (style: string) => {
    setPreferences((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }));
  };

  const handleColorSelect = (color: string) => {
    setPreferences((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleOccasionSelect = (occasion: string) => {
    setPreferences((prev) => ({
      ...prev,
      occasions: prev.occasions.includes(occasion)
        ? prev.occasions.filter((o) => o !== occasion)
        : [...prev.occasions, occasion],
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and navigate to next screen
      handleFinish();
    }
  };
  const handleSubmitInviteCode = async () => {
    const code = preferences.referralCode?.trim();
    if (!code) return;

    setIsInviteCodeValid(false);
    setIsValidatingCode(true);

    try {
      const isValid = await handleCheckInviteCode(code);
      setIsInviteCodeValid(isValid);
    } finally {
      setIsValidatingCode(false);
      setIsPressedSubmit(true);
    }
  };

  const handleCheckInviteCode = async (code: string) => {
    if (!code.trim()) return false;

    try {
      const result = await validateInviteCode({ code: code.trim() });
      return result.valid;
    } catch (error) {
      console.error("Failed to validate invite code:", error);
      return false;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const saveOnBoardingStatus = async () => {
    if (user) {
      try {
        user?.update({
          unsafeMetadata: { hasCompletedOnboarding: true },
        })
      } catch (error) {
        console.error("Failed to update onboarding status:", error);
      }
    }
  }

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Always store preferences in context first
      setStylePrefs(preferences);
      

      // If user is signed in, save to database immediately
      if (isSignedIn && user) {
        try {
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
          console.log("Style Preferences saved to database");
          saveOnBoardingStatus();

          // Check if user has completed onboarding to determine navigation
          // Changed: Check for explicit true value, treat undefined as incomplete onboarding
          // if (user?.unsafeMetadata?.hasCompletedOnboarding === true) {
            // User is updating preferences, go back to main app
            router.replace("/(tabs)");
          // } else {
          //   // First time setup or incomplete onboarding, continue to paywall
          //   router.replace("/onBordingScreens/payWall");
          // }
        } catch (dbError) {
          console.error("Failed to save to database:", dbError);
          // Continue with flow even if database save fails
          if (user?.publicMetadata?.hasCompletedOnboarding === true) {
            router.replace("/(tabs)");
          } else {
            router.replace("/onBordingScreens/payWall");
          }
        }
      } else {
        // User not signed in yet, redeem invite code and navigate to sign-up
        // Preferences are stored in context and will be saved after authentication
        try {
          // Store the invite code temporarily for redemption after sign-up
          // We'll handle the actual redemption in the sign-up flow
          console.log(
            "Invite code will be redeemed after sign-up:",
            preferences.referralCode
          );
          router.replace("/(auth)/sign-up");
        } catch (error) {
          console.error("Failed to process invite code:", error);
          Alert.alert(
            "Error",
            "Failed to process invite code. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Failed to process preferences:", error);
      Alert.alert(
        "Error",
        "Failed to save your preferences. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return preferences.styles.length > 0;
      case 2:
        return preferences.colors.length > 0;
      case 3:
        return true; // Fit is optional
      case 4:
        return true; // Avoid clothing is optional
      case 5:
        return preferences.occasions.length > 0;
      case 6:
        return true; // Seasonal preference
      case 7:
        return preferences.height && preferences.weight;
      case 8:
        return isInviteCodeValid; // Require valid invite code
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>What's your typical style?</Text>
            <Text style={styles.questionSubtitle}>Choose all that apply</Text>
            <View style={styles.optionsGrid}>
              {STYLE_OPTIONS.map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.styleOption,
                    preferences.styles.includes(style) && styles.selectedOption,
                  ]}
                  onPress={() => handleStyleSelect(style)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      preferences.styles.includes(style) && styles.selectedText,
                    ]}
                  >
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.whyText}>
              💡 Why: This helps filter combinations by vibe and avoid
              mismatches in AI outfit generation.
            </Text>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>
              What colors do you usually wear?
            </Text>
            <Text style={styles.questionSubtitle}>
              Select your preferred colors
            </Text>
            <View style={styles.colorGrid}>
              {ONBOARDING_COLOR_OPTIONS.map(
                (colorOption: { name: string; color: string }) => (
                  <TouchableOpacity
                    key={colorOption.name}
                    style={[
                      styles.colorOption,
                      preferences.colors.includes(colorOption.name) &&
                        styles.selectedColorOption,
                    ]}
                    onPress={() => handleColorSelect(colorOption.name)}
                  >
                    <View
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: colorOption.color },
                        colorOption.name === "White" && {
                          borderWidth: 1,
                          borderColor: COLORS.border,
                        },
                      ]}
                    />
                    <Text style={styles.colorText}>{colorOption.name}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
            <Text style={styles.whyText}>
              💡 Why: Avoid recommending clashing palettes or colors users hate.
            </Text>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>
              What's your go-to fit for clothes?
            </Text>
            <Text style={styles.questionSubtitle}>Optional - choose one</Text>
            <View style={styles.optionsContainer}>
              {FIT_OPTIONS.map((fit) => (
                <TouchableOpacity
                  key={fit}
                  style={[
                    styles.fitOption,
                    preferences.fit === fit && styles.selectedOption,
                  ]}
                  onPress={() => setPreferences((prev) => ({ ...prev, fit }))}
                >
                  <Text
                    style={[
                      styles.optionText,
                      preferences.fit === fit && styles.selectedText,
                    ]}
                  >
                    {fit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.whyText}>
              💡 Why: This affects silhouette coordination (e.g., pairing baggy
              tops with tapered bottoms).
            </Text>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>
              Any clothing types you avoid?
            </Text>
            <Text style={styles.questionSubtitle}>
              Optional - e.g., jeans, hoodies, sandals
            </Text>
            <TextInput
              style={styles.textInput}
              value={preferences.avoidClothing}
              onChangeText={(text) =>
                setPreferences((prev) => ({ ...prev, avoidClothing: text }))
              }
              placeholder="Type clothing items you don't wear..."
              multiline
              numberOfLines={4}
            />
            <Text style={styles.whyText}>
              💡 Why: Prevents recommending pieces they don't like or wear.
            </Text>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>
              What occasions do you dress for most?
            </Text>
            <Text style={styles.questionSubtitle}>Choose your top 3</Text>
            <View style={styles.optionsContainer}>
              {OCCASION_OPTIONS.map((occasion) => (
                <TouchableOpacity
                  key={occasion}
                  style={[
                    styles.occasionOption,
                    preferences.occasions.includes(occasion) &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleOccasionSelect(occasion)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      preferences.occasions.includes(occasion) &&
                        styles.selectedText,
                    ]}
                  >
                    {occasion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.whyText}>
              💡 Why: This guides outfit context when AI generates combinations.
            </Text>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>
              Would you like seasonal outfit previews?
            </Text>
            <Text style={styles.questionSubtitle}>
              We'll adapt recommendations to current weather
            </Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  preferences.seasonalOutfits && styles.selectedOption,
                ]}
                onPress={() =>
                  setPreferences((prev) => ({ ...prev, seasonalOutfits: true }))
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    preferences.seasonalOutfits && styles.selectedText,
                  ]}
                >
                  Yes, adapt to weather
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  !preferences.seasonalOutfits && styles.selectedOption,
                ]}
                onPress={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    seasonalOutfits: false,
                  }))
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    !preferences.seasonalOutfits && styles.selectedText,
                  ]}
                >
                  No, keep it simple
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.whyText}>
              💡 Why: Prepares them for dynamic, seasonal AI dressing.
            </Text>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>Height & Weight</Text>
            <Text style={styles.questionSubtitle}>
              This will be used to to generate outfits for your body type.
            </Text>

            {/* Imperial/Metric Toggle */}
            <View style={styles.unitToggleContainer}>
              <Text
                style={[
                  styles.unitLabel,
                  !preferences.isMetric && styles.activeUnitLabel,
                ]}
              >
                Imperial
              </Text>
              <TouchableOpacity
                style={styles.toggleSwitch}
                onPress={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    isMetric: !prev.isMetric,
                    height: "", // Reset selections when switching units
                    weight: "",
                  }))
                }
              >
                <View
                  style={[
                    styles.toggleKnob,
                    preferences.isMetric && styles.toggleKnobActive,
                  ]}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.unitLabel,
                  preferences.isMetric && styles.activeUnitLabel,
                ]}
              >
                Metric
              </Text>
            </View>

            {/* Height and Weight Pickers */}
            <View style={styles.pickersContainer}>
              {/* Height Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerTitle}>Height</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={preferences.height}
                    style={styles.picker}
                    onValueChange={(itemValue) =>
                      setPreferences((prev) => ({ ...prev, height: itemValue }))
                    }
                  >
                    <Picker.Item label="Select height" value="" />
                    {(preferences.isMetric
                      ? METRIC_HEIGHTS
                      : IMPERIAL_HEIGHTS
                    ).map((height) => (
                      <Picker.Item key={height} label={height} value={height} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Weight Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerTitle}>Weight</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={preferences.weight}
                    style={styles.picker}
                    onValueChange={(itemValue) =>
                      setPreferences((prev) => ({ ...prev, weight: itemValue }))
                    }
                  >
                    <Picker.Item label="Select weight" value="" />
                    {(preferences.isMetric
                      ? METRIC_WEIGHTS
                      : IMPERIAL_WEIGHTS
                    ).map((weight) => (
                      <Picker.Item key={weight} label={weight} value={weight} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        );

      //  In future, this case will be referral code step.
      // For now, this is invite code & required to complete the onboarding flow
      case 8:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>Invite Code</Text>
            <Text style={styles.questionSubtitle}>
              Enter your invite code to create account
            </Text>
            <View style={styles.inviteCodeContainer}>
              <TextInput
                style={[
                  styles.referralInput,
                  isInviteCodeValid && styles.validCodeInput,
                  isValidatingCode && styles.validatingCodeInput,
                ]}
                onChangeText={(text) => {
                  setPreferences((prev) => ({
                    ...prev,
                    referralCode: text,
                  }));
                  setIsInviteCodeValid(false); // reset until user presses done
                }}
                value={preferences.referralCode}
                onSubmitEditing={handleSubmitInviteCode}
                placeholder="Enter invite code"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                returnKeyType="done"
              />

              {isValidatingCode && (
                <Text style={styles.validatingText}>Validating...</Text>
              )}

              {isInviteCodeValid === true && (
                <Text style={styles.validCodeText}>✓ Valid invite code</Text>
              )}

              {isInviteCodeValid === false &&
               isPressedSubmit &&     
                (
                  <Text style={styles.invalidCodeText}>
                    ✗ Invalid invite code
                  </Text>
                )}
            </View>
            <Text style={styles.whyText}>
              Don't have invite code? Please email us at{" "}
              {"zwag.hello@gmail.com"}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.offWhite} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Progress Bar in Footer */}
          <View style={styles.footerProgressContainer}>
            <View style={styles.footerProgressBar}>
              <View
                style={[
                  styles.footerProgressFill,
                  { width: `${(currentStep / totalSteps) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.footerProgressText}>
              {currentStep} of {totalSteps}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.nextButton,
              (!canProceed() || isLoading) && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!canProceed() || isLoading}
          >
            <Text
              style={[
                styles.nextButtonText,
                (!canProceed() || isLoading) && styles.disabledButtonText,
              ]}
            >
              {isLoading
                ? "Saving..."
                : currentStep === totalSteps
                  ? "Finish Setup"
                  : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pureWhite,
    paddingHorizontal: SPACING.sm,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 22,
    backgroundColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholder: {
    width: 44, // Match back button width for perfect balance
    height: 44, // Match back button height for visual alignment
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  questionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  styleOption: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
    alignItems: "center",
  },
  selectedOption: {
    borderColor: COLORS.textPrimary,
    backgroundColor: COLORS.textPrimary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  selectedText: {
    color: COLORS.pureWhite,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  colorOption: {
    width: (width - 80) / 3,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 16,
  },
  selectedColorOption: {
    borderColor: COLORS.textPrimary,
    backgroundColor: "#f8f9fa",
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  colorText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: 24,
  },
  fitOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
    alignItems: "center",
  },
  occasionOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
    alignItems: "center",
  },
  toggleContainer: {
    marginBottom: 24,
  },
  toggleOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.offWhite,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  measurementsContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  measurementInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.offWhite,
  },
  whyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  },
  footerProgressContainer: {
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  footerProgressBar: {
    width: "100%",
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  footerProgressFill: {
    height: "100%",
    backgroundColor: COLORS.textPrimary,
    borderRadius: 2,
  },
  footerProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 0,
  },
  nextButton: {
    backgroundColor: COLORS.textPrimary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.pureWhite,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  // Height/Weight Picker Styles
  unitToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  unitLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginHorizontal: 16,
  },
  activeUnitLabel: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  toggleSwitch: {
    width: 60,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.pureWhite,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleKnobActive: {
    transform: [{ translateX: 30 }],
    backgroundColor: COLORS.textPrimary,
  },
  pickersContainer: {
    flexDirection: "column",
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  pickerColumn: {
    flex: 0,
    marginVertical: 8,
    marginHorizontal: 0,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  pickerWrapper: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  picker: {
    height: 150,
    width: "100%",
  },
  referralInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.offWhite,
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 24,
  },
  inviteCodeContainer: {
    marginBottom: 24,
  },
  validCodeInput: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  validatingCodeInput: {
    borderColor: COLORS.darkGray,
    backgroundColor: COLORS.offWhite,
  },
  validatingText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  validCodeText: {
    fontSize: 14,
    color: "#4CAF50",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  invalidCodeText: {
    fontSize: 14,
    color: "#F44336",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
});
