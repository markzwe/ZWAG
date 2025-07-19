import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { BORDER_RADIUS, COLORS } from "@/constants/theme";

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  setCategory: (category: string) => void;
};

export default function CategoryModal({
  visible,
  onClose,
  setCategory,
}: CategoryModalProps) {
  const categoryOptions = [
    "Tops",
    "Bottoms",
    "Outerwear",
    "Shoes",
    "Full Body",
    "Accessories",
  ];

  const [selectedCategory, setSelectedCategory] = React.useState("");

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCategory(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <BlurView intensity={60} tint="dark" style={styles.sheetContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Select a Category</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categoryOptions.map((option) => {
              const isSelected = selectedCategory === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleCategoryChange(option)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.success}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  sheetContainer: {
    height: "50%",
    width: "100%",
    padding: 10,
    paddingTop: 10,
    borderTopLeftRadius: BORDER_RADIUS.apple,
    borderTopRightRadius: BORDER_RADIUS.apple,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    height: 40,
  },
  closeButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.offWhite,
    textAlign: "center",
    flex: 1,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryItemSelected: {
    backgroundColor: COLORS.pureWhite,
    borderColor: COLORS.success,
  },
  categoryText: {
    fontSize: 16,
    color: COLORS.offWhite,
    fontWeight: "500",
  },
  categoryTextSelected: {
    color: COLORS.black,
    fontWeight: "700",
  },
});
