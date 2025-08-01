import { BORDER_RADIUS, COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const occasions = [
  { id: "work", label: "Work", icon: "briefcase-outline" },
  { id: "casual", label: "Casual", icon: "person-outline" },
  { id: "date", label: "Date", icon: "heart-outline" },
  { id: "gym", label: "Gym", icon: "barbell-outline" },
];


export default function AskOccasion() {

  const [selectedOccasion, setSelectedOccasion] = useState("");
  const handleContinue = () => {
    if (selectedOccasion) {
      router.push({
        pathname: '/screens/generateOutfit/askWeather',
        params: { occasion: selectedOccasion }
      });
    }
    else {
      Alert.alert("No Occasion Selected", "Please select an occasion before continuing.");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={COLORS.offWhite} />
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={styles.title}>1. Where are you going?</Text>
        <Text style={styles.subtitle}>Select the occasion for your outfit</Text>
        <View style={styles.optionsRow}>
          {occasions.map((occasion) => (
            <TouchableOpacity
              key={occasion.id}
              style={[
                styles.optionButton,
                selectedOccasion === occasion.id && styles.selectedButton,
              ]}
              onPress={() => setSelectedOccasion(occasion.id)}
            >
              <Ionicons
                name={occasion.icon as any}
                size={24}
                color={selectedOccasion === occasion.id ? "#fff" : "#000"}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedOccasion === occasion.id && styles.selectedText,
                ]}
              >
                {occasion.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedOccasion && styles.continueButtonDisabled,
          ]}
          onPress={
          handleContinue
          }
          disabled={!selectedOccasion}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.pureWhite} />
        </TouchableOpacity>
      </View>
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
    backgroundColor: COLORS.darkGray,
    borderRadius: 32,
    padding: 8,
  },
  section: {
    marginTop: SPACING.sm,
    marginBottom: 40,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    backgroundColor: "#fff",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
    title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    width: "48%",
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedButton: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
  },
  selectedText: {
    color: "#fff",
  },
  continueButtonContainer: {
    position: "absolute",
    bottom: SPACING.lg,
    marginTop: SPACING.xl,
    alignSelf: "center",
    width: "100%",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  continueButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  continueButtonIcon: {
    color: COLORS.pureWhite,
  },
});
