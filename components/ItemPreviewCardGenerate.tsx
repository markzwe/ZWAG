import { COLORS, FONT_SIZES } from "@/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ItemsPreviewGenerateProps = {
  imageUri: string;
  itemCaption: string;
  category: string; // (optional)
  subcategory: string; // (optional)
  onPress: () => void; // Function to handle press events
  selected?: boolean; // Optional: highlight border if selected
};

export default function ItemsPreviewCardGenerate({
  imageUri,
  category,
  subcategory,
  onPress,
  selected = false,
}: ItemsPreviewGenerateProps) {
  return (
    <TouchableOpacity
      style={[styles.itemContainer, selected && styles.selectedContainer]}
      onPress={onPress}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.imagePreview}
        contentFit="contain"
      />
      <View style={styles.contentContainer}>
        <View style={styles.categoriesContainer}>
          {category && (
            <View style={styles.subcategoryContainer}>
              <Text style={styles.subcategoryText}>{subcategory}</Text>
            </View>
          )}
          {subcategory && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  borderContainer: {},
  itemContainer: {
    width: "48%", // or a fixed value like 170
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: COLORS.warmGrayAccent,
    flexDirection: "column",
    padding: 0,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    position: "relative",
    overflow: "hidden",
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  selectedContainer: {
    borderWidth: 5,
    borderColor: COLORS.blue,
  },
  imagePreview: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: COLORS.border,
  },
  contentContainer: {
    padding: 5,
    gap: 12,
  },
  itemCaption: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.darkGray,
    lineHeight: 20,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  categoriesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  subcategoryContainer: {
    backgroundColor: COLORS.black,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  subcategoryText: {
    color: COLORS.pureWhite,
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  categoryContainer: {
    backgroundColor: "transparent",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: "flex-start",
  },
  categoryText: {
    color: COLORS.darkGray,
    fontSize: FONT_SIZES.xs,
    fontWeight: "500",
    letterSpacing: 0.2,
    opacity: 0.8,
  },
});
