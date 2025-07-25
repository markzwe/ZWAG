import React from "react";
import {
  Modal,
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "@/constants/theme"; // Replace with your own theme or remove

type BrandModalProps = {
  visible: boolean;
  onClose: () => void;
  setBrand: (brand: string) => void; // Function to set the selected brand
};

export default function BrandModal({ visible, onClose, setBrand }: BrandModalProps) {
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

  const brands = ["NIKE", "ADIDAS", "PUMA", "REEBOK", "UNDER ARMOUR", "ASICS", "NEW BALANCE", "CONVERSE", "VANS", "FILA"];

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.title}></Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Search brands..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />

        <FlatList
          data={brands.filter((brand) =>
            brand.toLowerCase().includes(search.toLowerCase())
          )}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.brandItem}
              onPress={() => {
                setBrand(item);
                onClose();
              }}
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
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  searchInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: SPACING.md,
    color: "#000",
  },
  brandItem: {
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  brandText: {
    fontSize: 16,
    color: "#333",
  },
});
