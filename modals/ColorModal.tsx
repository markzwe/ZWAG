import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ColorModalProps = {
  visible: boolean;
  onClose: () => void;
  setColor: (color: string) => void;
  selectedColor?: string;
};

export default function ColorModal({
  visible,
  onClose,
  setColor,
  selectedColor,
}: ColorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const colorOptions = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Gray", hex: "#808080" },
    { name: "Navy", hex: "#1B2951" },
    { name: "Blue", hex: "#4A90E2" },
    { name: "Red", hex: "#E74C3C" },
    { name: "Green", hex: "#27AE60" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Pink", hex: "#FF69B4" },
    { name: "Purple", hex: "#9B59B6" },
    { name: "Yellow", hex: "#F1C40F" },
    { name: "Orange", hex: "#FF8C00" },
    { name: "Burgundy", hex: "#800020" },
    { name: "Olive", hex: "#808000" },
    { name: "Cream", hex: "#FFF8DC" },
    { name: "Khaki", hex: "#C3B091" },
    { name: "Maroon", hex: "#800000" },
    { name: "Teal", hex: "#008080" },
    { name: "Coral", hex: "#FF7F50" },
  ];

  const filteredColors = colorOptions.filter((color) =>
    color.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleColorSelect = (colorName: string) => {
    setColor(colorName);
    onClose();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Select Color</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search colors..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery("")}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Color Grid */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.colorGrid}
        >
          {filteredColors.map((colorOption) => {
            const isSelected = selectedColor === colorOption.name;
            return (
              <TouchableOpacity
                key={colorOption.name}
                style={[
                  styles.colorOption,
                  isSelected && styles.colorOptionSelected,
                ]}
                onPress={() => handleColorSelect(colorOption.name)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: colorOption.hex },
                    colorOption.name === "White" && styles.whiteBorder,
                  ]}
                />
                <Text
                  style={[
                    styles.colorName,
                    isSelected && styles.colorNameSelected,
                  ]}
                >
                  {colorOption.name}
                </Text>
             
              </TouchableOpacity>
            );
          })}
          {filteredColors.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Ionicons
                name="color-palette-outline"
                size={48}
                color={COLORS.textSecondary}
              />
              <Text style={styles.noResultsText}>No colors found</Text>
              <Text style={styles.noResultsSubtext}>
                Try searching for a different color
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryBackground,
    position: "relative",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  closeButton: {
    position: "absolute",
    right: SPACING.md,
    top: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.primaryBackground,
  },
  searchInputContainer: {
    position: "relative",
    backgroundColor: COLORS.pureWhite,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchIcon: {
    position: "absolute",
    left: SPACING.sm,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 45,
    paddingRight: 45,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "400",
  },
  clearButton: {
    position: "absolute",
    right: SPACING.sm,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: SPACING.xl,
  },
  colorOption: {
    alignItems: "center",
    justifyContent: "center",
    width: "23%", // 4 colors per row with proper spacing
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.pureWhite,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    ...SHADOWS.sm,
  },
  colorOptionSelected: {
    borderColor: COLORS.textPrimary,
    backgroundColor: COLORS.offWhite,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  whiteBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  colorNameSelected: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  colorSelectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl * 2,
    width: "100%",
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    letterSpacing: -0.2,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
});
