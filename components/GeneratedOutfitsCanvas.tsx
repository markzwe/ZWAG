import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Canvas, useCanvasRef } from "@shopify/react-native-skia";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
type GeneratedOutfitsCanvasProps = {
  // Define any props if needed
  topItem: string; // Example prop for the top item
  bottomItem: string; // Example prop for the bottom item
  shoes?: string; // Example prop for the shoes
  outerwear?: string; // Optional prop for outerwear
  accessories?: string[]; // Optional prop for accessories
  fullBody?: string; // Optional prop to indicate full body outfit
  // Add more props as needed
};

export default function GeneratedOutfitsCanvas() {
  const ref = useCanvasRef();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryBackground }}>
   
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, color: COLORS.textPrimary }}>
          Generated Outfits
        </Text>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Canvas style={{ width: "100%", height: "100%" }} ref={ref}>
          {/* Render your generated outfits here */}
        </Canvas>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    width: "100%",
    height: "80%",
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
