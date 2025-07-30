import GeneratedOutfitsCanvas from "@/components/GeneratedOutfitsCanvas";
import { COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { Canvas, useCanvasRef } from "@shopify/react-native-skia";
import { useAction, useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AiGenerateOutfit() {
  const { selectedIds, occasion, weather } = useLocalSearchParams();
  const selectedIdsArray =
    typeof selectedIds === "string" ? selectedIds.split(",") : [];
  const ref = useCanvasRef();
  const insets = useSafeAreaInsets();
  console.log("Selected IDs in AiGenerateOutfit:", selectedIdsArray);
const getItems = useQuery(api.items.getItemsForGenerateOutfit);

const generateOutfit = useAction(api.generateOutfits.analyzeOutfit);

const handleGenerate = async () => {
  if (!getItems) return; // Wait for items to load
  try {
    const result = await generateOutfit({
      items: getItems.map(item => ({
        ...item,
        color: item.color ?? "",
      })),
      preferredItemsId: selectedIdsArray,
      occasion: occasion as string,
      weather: weather as string,
    });
    console.log("Generated Outfit:", result);
  } catch (err) {
    // Handle error
  }
};
handleGenerate();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          style={styles.backButton}
        >
          <Ionicons name="close-outline" size={24} color={COLORS.offWhite} />
        </TouchableOpacity>

        <Image
          source={require("@/assets/images/ZWAG-header.png")}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Your AI Generated Outfit</Text>

      {/* Summary Section */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Selection Summary</Text>
        <Text style={styles.summaryText}>
          Items:{" "}
          {selectedIdsArray.length > 0
            ? selectedIdsArray.join(", ")
            : "None selected"}
        </Text>
        <Text style={styles.summaryText}>
          Occasion: {occasion || "Not specified"}
        </Text>
        <Text style={styles.summaryText}>
          Weather: {weather || "Not specified"}
        </Text>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasContainer}>
        <GeneratedOutfitsCanvas
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  backButton: {
    width: 40,
    backgroundColor: COLORS.darkGray,
    borderRadius: 32,
    padding: 8,
    position: "relative",
    left: SPACING.md,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    flexDirection: "row",
    width: "100%",
    position: "relative",
  },
  logo: {
    width: 80,
    height: 40,
    marginBottom: 8,
    resizeMode: "contain",
    alignSelf: "center",
    marginLeft: 'auto',
    marginRight: "auto",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  summaryBox: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  canvasContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  canvas: {
    flex: 1,
    width: "60%",
    height: 11,
    borderRadius: 18,
    backgroundColor: COLORS.black,
    alignSelf: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});
