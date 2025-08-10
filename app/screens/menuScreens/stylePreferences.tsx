import { COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const STYLE_OPTIONS = [
  "Casual",
  "Streetwear",
  "Minimalist",
  "Sporty",
  "Business / Smart Casual",
  "Vintage",
  "Trendy",
  "Preppy",
];

const COLOR_OPTIONS = [
  { name: "Black", color: "#000000" },
  { name: "White", color: "#FFFFFF" },
  { name: "Gray", color: "#808080" },
  { name: "Navy", color: "#000080" },
  { name: "Earth tones", color: "#8B4513" },
  { name: "Brights", color: "#FF4500" },
  { name: "Neutrals", color: "#F5F5DC" },
];

const FIT_OPTIONS = [
  "Oversized",
  "Slim / Fitted",
  "Relaxed",
  "Classic",
  "Depends on the piece",
];

const OCCASION_OPTIONS = [
  "School / Campus",
  "Work",
  "Dates",
  "Going out / Parties",
  "Gym / Sports",
  "Travel",
  "Casual hangouts",
];

export default function StylePreferences() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get current user preferences
  const userPreferences = useQuery(api.users.getCurrentUser);
  const updateStylePreferences = useMutation(api.users.updateStylePreferences);

  // Local state for editing
  const [preferences, setPreferences] = useState({
    styles: [] as string[],
    colors: [] as string[],
    fit: "",
    avoidClothing: "",
    occasions: [] as string[],
    seasonalOutfits: false,
    height: "",
    weight: "",
  });

  // Load user preferences when data is available
  useEffect(() => {
    if (userPreferences) {
      setPreferences({
        styles: userPreferences.stylePreferences || [],
        colors: userPreferences.favoriteColors || [],
        fit: userPreferences.fitPreference || "",
        avoidClothing: userPreferences.avoidClothing || "",
        occasions: userPreferences.preferredOccasions || [],
        seasonalOutfits: userPreferences.seasonalOutfits || false,
        height: userPreferences.height || "",
        weight: userPreferences.weight || "",
      });
    }
  }, [userPreferences]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStylePreferences({
        stylePreferences: preferences.styles,
        favoriteColors: preferences.colors,
        height: preferences.height,
        weight: preferences.weight,
        fitPreference: preferences.fit,
        avoidClothing: preferences.avoidClothing,
        preferredOccasions: preferences.occasions,
        preferredBrands: "", // Keep existing or empty
        seasonalOutfits: preferences.seasonalOutfits,
      });

      Alert.alert("Success", "Your style preferences have been updated!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!userPreferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.offWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Style Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Style Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Style</Text>
          <Text style={styles.sectionSubtitle}>Choose all that apply</Text>
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
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Color Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Colors</Text>
          <Text style={styles.sectionSubtitle}>
            Select your preferred colors
          </Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((colorOption) => (
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
                <Text
                  style={[
                    styles.colorText,
                    preferences.colors.includes(colorOption.name) &&
                      styles.selectedText,
                  ]}
                >
                  {colorOption.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Fit Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Fit</Text>
          <Text style={styles.sectionSubtitle}>Choose your go-to fit</Text>
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
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Occasions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Occasions</Text>
          <Text style={styles.sectionSubtitle}>
            When do you need outfit suggestions?
          </Text>
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
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Avoid Clothing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clothing to Avoid</Text>
          <Text style={styles.sectionSubtitle}>
            Items you don't like to wear
          </Text>
          <TextInput
            style={styles.textInput}
            value={preferences.avoidClothing}
            onChangeText={(text) =>
              setPreferences((prev) => ({ ...prev, avoidClothing: text }))
            }
            placeholder="e.g., jeans, hoodies, sandals"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Measurements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurements</Text>
          <Text style={styles.sectionSubtitle}>Your height and weight</Text>
          <View style={styles.measurementsRow}>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Height</Text>
              <TextInput
                style={styles.measurementInput}
                value={preferences.height}
                onChangeText={(text) =>
                  setPreferences((prev) => ({ ...prev, height: text }))
                }
                placeholder="5'8&quot;"
              />
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Weight</Text>
              <TextInput
                style={styles.measurementInput}
                value={preferences.weight}
                onChangeText={(text) =>
                  setPreferences((prev) => ({ ...prev, weight: text }))
                }
                placeholder="150 lbs"
              />
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Seasonal Outfits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seasonal Recommendations</Text>
          <Text style={styles.sectionSubtitle}>Adapt outfits to weather</Text>
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
                setPreferences((prev) => ({ ...prev, seasonalOutfits: false }))
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
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pureWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 22,
    backgroundColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  styleOption: {
    width: (width - 48) / 2,
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  selectedOption: {
    borderColor: COLORS.textPrimary,
    backgroundColor: COLORS.textPrimary,
  },
  optionText: {
    fontSize: 14,
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
  },
  colorOption: {
    width: (width - 64) / 3,
    alignItems: "center",
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: SPACING.sm,
  },
  selectedColorOption: {
    borderColor: COLORS.textPrimary,
    backgroundColor: "#f8f9fa",
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: SPACING.xs,
  },
  colorText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  optionsContainer: {},
  fitOption: {
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  occasionOption: {
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  toggleContainer: {},
  toggleOption: {
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.offWhite,
    textAlignVertical: "top",
  },
  measurementsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  measurementItem: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  measurementInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.offWhite,
  },
  bottomSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.pureWhite,
  },
  saveButton: {
    backgroundColor: COLORS.textPrimary,
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.pureWhite,
  },
});
