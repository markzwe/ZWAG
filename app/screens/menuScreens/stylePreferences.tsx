import { COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
    avoidClothing: "",
    occasions: [] as string[],
    height: "",
    weight: "",
  });

  // Load user preferences when data is available
  useEffect(() => {
    if (userPreferences) {
      setPreferences({
        avoidClothing: userPreferences.avoidClothing || "",
        occasions: userPreferences.preferredOccasions || [],
        height: userPreferences.height || "",
        weight: userPreferences.weight || "",
      });
    }
  }, [userPreferences]);

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
        stylePreferences: [],
        favoriteColors: [],
        height: preferences.height,
        weight: preferences.weight,
        fitPreference: "",
        avoidClothing: preferences.avoidClothing,
        preferredOccasions: preferences.occasions,
        preferredBrands: "", // Keep existing or empty
      });

      Alert.alert("Success", "Your outfit preferences have been updated!", [
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
        <Text style={styles.headerTitle}>Outfit Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
            Items you don&apos;t like to wear
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
  optionsContainer: {},
  occasionOption: {
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
