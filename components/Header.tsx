import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";

export default function Header() {

    const handleOpenMenu = () => {
        // Logic to open the menu can be added here
        router.push("/screens/menu");
    };
  return (
    <View style={styles.headerContainer}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.logoImage}
        />
        <Text style={styles.appTitle}>Mantire</Text>
      </View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7} onPress={handleOpenMenu}>
        <Ionicons name="menu" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryBackground,
    ...SHADOWS.sm,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },
});
