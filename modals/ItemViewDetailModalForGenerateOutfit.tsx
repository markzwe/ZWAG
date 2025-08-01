import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
// import { deleteItem } from "@/convex/items"; // Remove this line
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type ItemViewDetailModalForGenerateOutfitProps = {
  itemId: Id<"items">;
  visible: boolean;
  onClose: () => void;
};

export default function ItemViewDetailModalForGenerateOutfit(
  props: ItemViewDetailModalForGenerateOutfitProps
) {
  const { itemId, visible, onClose } = props;
  const insets = useSafeAreaInsets();

  const item = useQuery(
    api.items.getOneItemById,
    itemId ? { itemId: itemId as Id<"items"> } : "skip"
  );


  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [style, setStyle] = useState<string[]>([]);
  const [color, setColor] = useState("");
  const [caption, setCaption] = useState("");
  const [brand, setBrand] = useState("");
  const styleOptions = [
    "Casual",
    "Formal",
    "Business",
    "Sportswear",
    "Loungewear",
    "Streetwear",
  ];

  useEffect(() => {
    if (item) {
      setCategory(item.category);
      setSubcategory(item.subcategory);
      setStyle(item.style || []);
      setColor(item.color ?? "");
      setCaption(item.caption);
      setBrand(item.brand ?? "");
    }
  }, [item]);


  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Modal
      presentationStyle="pageSheet"
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, {}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="close-outline" size={24} color={COLORS.offWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {},
        ]}
      >
        {/* Image Preview Card */}
        <View style={styles.imageCard}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.inputCard}>
              <Text
                style={[
                  styles.pickerText,
                  !category && styles.placeholderTextInput,
                ]}
              >
                {`${category} > ${subcategory}`}
              </Text>
            </View>
          </View>

          {/* Style Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsContainer}>
                {styleOptions.map((styleOption) => {
                  const isSelected = style.includes(styleOption);
                  return (
                    <View
                      key={styleOption}
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
                    </View>
                  );
                })}
              </View>
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
          {brand && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Brand</Text>
              <View style={styles.inputCard}>
                <Text
                  style={[
                    styles.pickerText,
                    !brand && styles.placeholderTextInput,
                  ]}
                >
                  {brand || "No brand selected"}
                </Text>
              </View>
            </View>
          )}

          {/* Description Section */}
          {caption && (
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionTitle}>
                {category ? `More about this ${subcategory}` : "Description"}
              </Text>
              <View style={[styles.inputCard, styles.textAreaCard]}>
                <Text
                  style={[styles.textInput, styles.textArea]}
                  numberOfLines={1}
                  selectionColor={COLORS.textPrimary}
                >
                  {caption || "No description provided."}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      {/* <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom }]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!category || !subcategory || style.length === 0) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!category || !subcategory || style.length === 0}
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={COLORS.pureWhite}
          />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View> */}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryBackground,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.md,
    zIndex: 10,

  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: COLORS.darkGray,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff5f5",
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
  scrollContainer: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
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
  },
  formContainer: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: BORDER_RADIUS.lg,
    width: "100%",
    ...SHADOWS.sm,
    paddingTop: SPACING.md,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  lastSection: {
    marginBottom: SPACING.md,
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
  placeholderTextInput: {
    color: COLORS.textSecondary,
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
  chipsContainer: {
    flexDirection: "row",
    paddingRight: SPACING.md,
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
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryBackground,
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
