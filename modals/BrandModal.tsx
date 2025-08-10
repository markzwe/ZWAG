import { brands } from "@/constants/brands"; // Assuming you have a list of brands in this file
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type BrandModalProps = {
  visible: boolean;
  onClose: () => void;
  setBrand: (brand: string) => void; // Function to set the selected brand
};

export default function BrandModal({
  visible,
  onClose,
  setBrand,
}: BrandModalProps) {
  const [search, setSearch] = React.useState("");

  const capitalizeWords = (text: string) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSearchChange = (text: string) => {
    const capitalized = capitalizeWords(text);
    setSearch(capitalized);
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Brand</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search brands..."
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
              value={search.toUpperCase()}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearch("")}
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

        <FlatList
          data={brands.filter((brand) =>
            brand.toLowerCase().includes(search.toLowerCase())
          )}
          keyExtractor={(item) => item}
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.brandItem}
              onPress={() => {
                setBrand(item);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.brandText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
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
  listContainer: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  brandItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.pureWhite,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  brandText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
});
