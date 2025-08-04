import { COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { VisionBgRemoverView } from "vision-bg-remover";

// Temporarily using fallback until we recreate the native module
const ExpoBackgroundRemoverView = View;

export default function VisionKitRemoval() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Set to true initially

  // Add a timeout fallback in case native events don't fire
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("⚠️ Timeout: Native events didn't fire, stopping loading");
        setLoading(false);
        setError("Processing took too long - using original image");
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No image provided</Text>
      </View>
    );
  }

  console.log("Processed Image URI from VisionKit:", processedImageUri);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VisionKit Background Removal</Text>

      <VisionBgRemoverView
        imageUri={imageUri}
        style={styles.visionKitView}
        onProcessingComplete={(event: {
          nativeEvent: { processedImageUri: string };
        }) => {
          console.log("✅ Processing complete:", event.nativeEvent);
          setProcessedImageUri(event.nativeEvent.processedImageUri);
          setLoading(false);
          setError(null);
        }}
        onProcessingError={(event: { nativeEvent: { error: string } }) => {
          console.log("❌ Processing error:", event.nativeEvent);
          setError(event.nativeEvent.error);
          setLoading(false);
        }}
      />

      {/* Loading indicator while processing */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.textPrimary} />
          <Text style={styles.loadingText}>
            {processedImageUri
              ? "Background removal complete!"
              : "Processing background removal..."}
          </Text>
        </View>
      )}

      {/* Fallback until native module is recreated */}
      {/* <View style={styles.visionKitView}>
        <Image
          source={{ uri: processedImageUri || imageUri }}
          style={{ flex: 1, borderRadius: 12 }}
          resizeMode="contain"
        />
        <Text style={styles.loadingText}>
          {processedImageUri
            ? "Background removed successfully!"
            : "Native VisionKit module temporarily unavailable - showing original image"}
        </Text>
      </View> */}

      {/* Error display */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Continue button */}
      <TouchableOpacity
        style={[styles.primaryActionButton, loading && styles.disabledButton]}
        onPress={() =>
          router.push({
            pathname: "/screens/closet/addedItem",
            params: {
              processedImageUri: processedImageUri ?? imageUri, // Use processed image if available, fallback to original
            },
          })
        }
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.pureWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground, // Changed from red to proper background
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
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  visionKitView: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#f0f0f0", // Add background color to see if view is rendered
    borderWidth: 2,
    borderColor: "#ccc", // Add border to see boundaries
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginVertical: SPACING.md,
    textAlign: "center",
    padding: SPACING.md,
    backgroundColor: "rgba(255,0,0,0.1)",
    borderRadius: 8,
  },
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  primaryActionButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});
