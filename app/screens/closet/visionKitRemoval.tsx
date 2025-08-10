import { COLORS, SPACING } from "@/constants/theme";
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
        // Auto-navigate with original image on timeout
        router.push({
          pathname: "/screens/closet/addedItem",
          params: {
            processedImageUri: imageUri, // Use original image as fallback
          },
        });
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading, imageUri]);

  // Auto-navigate when processed image is ready
  useEffect(() => {
    if (processedImageUri && !loading) {
      console.log(
        "🚀 Auto-navigating with processed image:",
        processedImageUri
      );
      // Small delay to show success state briefly
      setTimeout(() => {
        router.push({
          pathname: "/screens/closet/addedItem",
          params: {
            processedImageUri: processedImageUri,
          },
        });
      }, 500); // 500ms delay to show completion
    }
  }, [processedImageUri, loading]);

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
      {/* VisionKit processing view - hidden but functional */}
      <VisionBgRemoverView
        imageUri={imageUri}
        style={styles.hiddenVisionKitView}
        onProcessingComplete={(event: {
          nativeEvent: { processedImageUri: string };
        }) => {
          console.log("✅ Processing complete:", event.nativeEvent);
          setProcessedImageUri(event.nativeEvent.processedImageUri);
          setLoading(false);
          setError(null);
          // Note: Auto-navigation handled by useEffect above
        }}
        onProcessingError={(event: { nativeEvent: { error: string } }) => {
          console.log("❌ Processing error:", event.nativeEvent);
          setError(event.nativeEvent.error);
          setLoading(false);
          // Auto-navigate with original image on error
          setTimeout(() => {
            router.push({
              pathname: "/screens/closet/addedItem",
              params: {
                processedImageUri: imageUri, // Use original image as fallback
              },
            });
          }, 1000); // 1 second delay to show error briefly
        }}
      />

      {/* Clean loading screen */}
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
        <Text style={styles.loadingTitle}>
          {error
            ? "Processing failed, proceeding..."
            : processedImageUri
              ? "Background removal complete!"
              : "Removing background..."}
        </Text>
        <Text style={styles.loadingSubtitle}>
          {error ? "Using original image" : "Please wait a moment"}
        </Text>
      </View>

      {/* Error display - only if there's an error and manual intervention needed */}
      {error && (
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() =>
            router.push({
              pathname: "/screens/closet/addedItem",
              params: {
                processedImageUri: imageUri, // Use original image as fallback
              },
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.errorButtonText}>Continue Anyway</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  hiddenVisionKitView: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  loadingScreen: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginTop: SPACING.xl,
  },
  errorButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
  // Keep old styles for fallback compatibility
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
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#ccc",
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
