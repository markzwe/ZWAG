import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
// import { deleteItem } from "@/convex/items"; // Remove this line
import BrandModal from "@/modals/BrandModal";
import CategoryModal from "@/modals/CategoryModal";
import ColorModal from "@/modals/ColorModal";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ItemViewDetail() {
  const { itemId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const item = useQuery(
    api.items.getOneItemById,
    itemId ? { itemId: itemId as Id<"items"> } : "skip"
  );

  const updateItem = useMutation(api.items.updateItem);
  const deleteItem = useMutation(api.items.deleteItem);

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [style, setStyle] = useState<string[]>([]);
  const [color, setColor] = useState("");
  const [caption, setCaption] = useState("");
  const [brand, setBrand] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
    const [showColorModal, setShowColorModal] = useState<boolean>(false);
  

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

  const toggleStyle = (option: string) => {
    setStyle((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleSave = async () => {
    await updateItem({
      itemId: item._id,
      category,
      subcategory,
      style,
      color,
      caption,
    });
    Alert.alert("Success", "Item updated successfully");
  };

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteItem({ itemId: item._id });
            Alert.alert("Success", "Item deleted successfully");
            router.back();
          } catch (err) {
            Alert.alert("Error", "Failed to delete item");
          }
        },
      },
    ]);
  };
  const handleGoBackandSave = () => {
    router.back();
    handleSave();
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBackandSave}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.offWhite} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Item</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
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
            <TouchableOpacity
              style={styles.inputCard}
              onPress={() => setShowCategoryModal(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pickerText,
                  !category && styles.placeholderTextInput,
                ]}
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsContainer}>
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
              </View>
            </ScrollView>
          </View>

        {/* Color Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <TouchableOpacity
              style={styles.inputCard}
              onPress={() => setShowColorModal(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.pickerText, !color && styles.placeholderText]}
              >
                {color || "Select color"}
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

          {/* Brand Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand</Text>
            <TouchableOpacity
              style={styles.inputCard}
              onPress={() => setShowBrandModal(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pickerText,
                  !brand && styles.placeholderTextInput,
                ]}
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
          <View style={[styles.section, styles.lastSection]}>
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

      {/* Category Modal */}
      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        setCategory={setCategory}
        setSubcategory={setSubcategory}
      />

           {/* Color Modal */}
            <ColorModal
              visible={showColorModal}
              onClose={() => setShowColorModal(false)}
              setColor={setColor}
              selectedColor={color}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryBackground,
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
  },
  scrollContent: {
    paddingHorizontal: SPACING.sm,
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
  placeholderText: {
    marginTop: SPACING.sm,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
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
