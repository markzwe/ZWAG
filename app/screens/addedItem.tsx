import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

export default function AddedItem() {
  const { imageUri, processedImageUri: initialProcessedImageUri } =
    useLocalSearchParams<{
      imageUri: string;
      processedImageUri?: string;
    }>();
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(
    initialProcessedImageUri || null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const retryProcessing = () => {
    router.push({
      pathname: "/screens/visionKitRemoval",
      params: { imageUri },
    });
  };

  const retakePhoto = () => {
    setProcessedImageUri(null);
    router.back();
  };

  const saveToWardrobe = () => {
    if (processedImageUri) {
      Alert.alert("Success", "Clothing item added to your wardrobe!");
      // TODO: Add your save logic here
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {processedImageUri
          ? "Background Removed!"
          : "Process Your Clothing Item"}
      </Text>

      {/* Original Image */}
      <View style={styles.imageContainer}>
        <Text style={styles.sectionTitle}>Original Photo</Text>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!processedImageUri && (
          <TouchableOpacity
            style={[
              styles.processButton,
              isProcessing && styles.processingButton,
            ]}
            onPress={retryProcessing}
            disabled={isProcessing}
          >
            <Ionicons name="cut-outline" size={20} color={COLORS.pureWhite} />
            <Text style={styles.processButtonText}>Process with VisionKit</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={retakePhoto}>
          <Ionicons name="camera" size={20} color={COLORS.textPrimary} />
          <Text style={styles.secondaryButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Processed Image */}
      {processedImageUri && (
        <>
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Processed Image</Text>
            <View style={styles.whiteBackgroundContainer}>
              <Image
                source={{ uri: processedImageUri }}
                style={styles.processedImage}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveToWardrobe}>
            <Ionicons name="checkmark" size={20} color={COLORS.pureWhite} />
            <Text style={styles.saveButtonText}>Add to Wardrobe</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.md,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  imageContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  whiteBackgroundContainer: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  processedImage: {
    width: "100%",
    height: 300,
    borderRadius: BORDER_RADIUS.lg,
  },
  buttonContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  processButton: {
    backgroundColor: COLORS.black,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  processingButton: {
    backgroundColor: COLORS.mediumGray,
  },
  processButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: COLORS.success || COLORS.black,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  saveButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
  },
});
