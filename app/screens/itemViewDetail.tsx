import { COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
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

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [style, setStyle] = useState<string[]>([]);
  const [color, setColor] = useState("");
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (item) {
      setCategory(item.category);
      setSubcategory(item.subcategory);
      setStyle(item.style);
      setColor(item.color ?? "");
      setCaption(item.caption);
    }
  }, [item]);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
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
    Alert.alert("Item updated successfully");
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        contentFit="contain"
      />
      <Text style={styles.label}>Category</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} />

      <Text style={styles.label}>Subcategory</Text>
      <TextInput
        style={styles.input}
        value={subcategory}
        onChangeText={setSubcategory}
      />

      <Text style={styles.label}>Style (comma separated)</Text>
      <TextInput
        style={styles.input}
        value={style.join(", ")}
        onChangeText={(text) => setStyle(text.split(",").map((s) => s.trim()))}
      />

      <Text style={styles.label}>Color</Text>
      <TextInput style={styles.input} value={color} onChangeText={setColor} />

      <Text style={styles.label}>Caption</Text>
      <TextInput style={styles.input} value={caption} onChangeText={setCaption} />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.md,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.buttonBackground,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
