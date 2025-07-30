import { BORDER_RADIUS, COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const weather = [
  { id: "hot", label: "Hot", temp: "80°F+", icon: "sunny" },
  { id: "warm", label: "Warm", temp: "70-80°F", icon: "partly-sunny" },
  { id: "cool", label: "Cool", temp: "60-70°F", icon: "cloudy" },
  { id: "cold", label: "Cold", temp: "50-60°F", icon: "snow" },
];

export default function AskWeather() {
  const { occasion } = useLocalSearchParams();
  console.log("Selected Occasion in askWeather :", occasion);
  const [selectedWeather, setSelectedWeather] = useState("");

  const handleContinue = () => {
    if (selectedWeather) {
      router.push({
        pathname: "/screens/generateOutfit/askPrefrencedItem",
        params: { occasion, weather: selectedWeather },
      });
    } else {
      Alert.alert(
        "No Weather Selected",
        "Please select the weather before continuing."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={COLORS.offWhite} />
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={styles.title}>2. How's the weather?</Text>
        <View style={styles.optionsRow}>
          {weather.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.optionButton,
                selectedWeather === w.id && styles.selectedButton,
              ]}
              onPress={() => setSelectedWeather(w.id)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={w.icon as any}
                size={24}
                color={
                  selectedWeather === w.id
                    ? COLORS.pureWhite
                    : COLORS.textPrimary
                }
                style={styles.optionIcon}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedWeather === w.id && styles.selectedText,
                ]}
              >
                {w.label}
              </Text>
              <Text
                style={[
                  styles.tempText,
                  selectedWeather === w.id && styles.selectedText,
                ]}
              >
                {w.temp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedWeather && styles.continueButtonDisabled,
          ]}
          onPress={
          handleContinue
          }
          disabled={!selectedWeather}
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
    marginBottom: 40,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    backgroundColor: COLORS.pureWhite,
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
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  optionButton: {
    flex: 1,
    backgroundColor: COLORS.pureWhite,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginHorizontal: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  optionIcon: {
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  tempText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  selectedText: {
    color: COLORS.pureWhite,
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
