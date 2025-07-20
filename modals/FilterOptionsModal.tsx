import { COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type FilterOptionsModalProps = {
  visible: boolean;
  setFilter: (filter: string) => void;
  onClose: () => void;
};

const FILTER_OPTIONS = [
  "All",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Accessories",
];

export default function FilterOptionsModal({
  visible,
  setFilter,
  onClose,
}: FilterOptionsModalProps) {
  return (
    <Modal
      transparent={false}
      animationType="slide"
      visible={visible}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <BlurView intensity={50} style={StyleSheet.absoluteFill}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            onPress={onClose}
            style={{ alignSelf: "flex-end", marginBottom: 12 }}
          >
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter By Category</Text>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.optionButton}
              onPress={() => {
                setFilter(option);
                onClose();
              }}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  optionButton: {
    backgroundColor: COLORS.offWhite,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    alignItems: "center",
    width: 200,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  closeButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 16,
    alignItems: "center",
    width: 200,
  },
  closeButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
  },
});
