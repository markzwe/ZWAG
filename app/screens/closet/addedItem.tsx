import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import BrandModal from "@/modals/BrandModal";
import CategoryModal from "@/modals/CategoryModal";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddedItem() {
  const { processedImageUri } = useLocalSearchParams<{
    processedImageUri?: string;
  }>();
  // Debugging: Log the processed image URI
  console.log("Processed Image URI:", processedImageUri);

  const [category, setCategory] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showBrandModal, setShowBrandModal] = useState<boolean>(false);

  const styleOptions = [
    "Casual",
    "Formal",
    "Business",
    "Sportswear",
    "Loungewear",
    "Streetwear",
  ];

  const generatedUploadUrl = useMutation(api.items.generatedUploadUrl);
  const createItem = useMutation(api.items.uploadItem);
  const [subcategory, setSubcategory] = useState<string>("");
  const [style, setStyle] = useState<string[]>([]);
  const [brand, setBrand] = useState<string>("");

  const toggleStyle = (option: string) => {
    setStyle((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const saveToWardrobe = async () => {
    if (!processedImageUri) return;
    console.log('styleOptions:', styleOptions);
    try {
      const uploadUrl = await generatedUploadUrl();
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        processedImageUri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: "image/jpeg",
        }
      );

      if (uploadResult.status !== 200) throw new Error("Upload failed");

      const { storageId } = JSON.parse(uploadResult.body);
      await createItem({
        storageId,
        caption,
        category,
        subcategory, // Use the selected subcategory
        style,
        color,
      });
      router.push("/(tabs)");
    } catch (error) {
      console.error(error);
      Alert.alert("Upload Error", "There was a problem uploading the item.");
    } finally {
      Alert.alert("Success", "Clothing item added to your wardrobe!");
      setCategory("");
      setColor("");
      setCaption("");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)",)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.offWhite} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Preview Card */}
        <View style={styles.imageCard}>
          <View style={styles.imageContainer}>
            {processedImageUri ? (
              <Image
                source={{ uri: processedImageUri }}
                style={styles.image}
                contentFit="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={48}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}
          </View>
          <View style={styles.imageOverlay} />
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <TouchableOpacity
              style={styles.inputCard}
              onPress={() => setShowCategoryModal(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.pickerText, !category && styles.placeholderText]}
              >
                {category && subcategory
                  ? `${category} > ${subcategory}`
                  : "Select category"}
              </Text>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Style Section */}
          {/* Style Section (Multi-select Chips) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {styleOptions.map((styleOption) => {
                const isSelected = style.includes(styleOption);
                return (
                  <TouchableOpacity
                    key={styleOption}
                    onPress={() => toggleStyle(styleOption)}
                    style={[
                      styles.styleChip,
                      isSelected && styles.styleChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.styleChipText,
                        isSelected && styles.styleChipTextSelected,
                      ]}
                    >
                      {styleOption}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          {/* Color Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                placeholder="Navy blue, charcoal gray..."
                placeholderTextColor={COLORS.textSecondary}
                value={color}
                onChangeText={setColor}
                selectionColor={COLORS.textPrimary}
              />
              <View style={styles.inputIcon}>
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Brand Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand</Text>
            <TouchableOpacity
              style={styles.inputCard}
              onPress={() => setShowBrandModal(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.pickerText, !category && styles.placeholderText]}
              >
                {brand || "Select brand"}
              </Text>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Description Section */}
          <View style={[styles.section]}>
            <Text style={styles.sectionTitle}>
              {category ? `More about this ${subcategory}` : "Description"}
            </Text>
            <View style={[styles.inputCard, styles.textAreaCard]}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Casual cotton t-shirt, perfect for everyday wear..."
                placeholderTextColor={COLORS.textSecondary}
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                selectionColor={COLORS.textPrimary}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!category || !subcategory || style.length === 0) &&
              styles.saveButtonDisabled,
          ]}
          onPress={saveToWardrobe}
          disabled={!category || !subcategory || style.length === 0}
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={COLORS.pureWhite}
          />
          <Text style={styles.saveButtonText}>Save to Wardrobe</Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        setCategory={setCategory}
        setSubcategory={setSubcategory}
      />

      {/* Brand Modal */}
      <BrandModal
        visible={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        setBrand={setBrand}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  picker: {
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingRight: 50,
    fontWeight: "400",
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryBackground,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.darkGray,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 44,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: 20,
  },
  imageCard: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    backgroundColor: COLORS.pureWhite,
    ...SHADOWS.md,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    marginTop: SPACING.sm,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  formContainer: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: BORDER_RADIUS.lg,
    width: "100%",
    ...SHADOWS.sm,
  },
  section: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  inputCard: {
    position: "relative",
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  textAreaCard: {
    minHeight: 80,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingRight: 50,
    fontWeight: "400",
  },

  textInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingRight: 50,
    fontWeight: "400",
  },
  textArea: {
    minHeight: 80,
    paddingTop: SPACING.md,
  },
  inputIcon: {
    position: "absolute",
    right: SPACING.md,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  styleChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  styleChipSelected: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },

  styleChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  styleChipTextSelected: {
    color: COLORS.pureWhite,
  },

  ChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "transparent", // Use transparent to avoid visual issues
  },
  saveButton: {
    backgroundColor: COLORS.textPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: SPACING.sm,
    letterSpacing: -0.2,
  },
});
