import { COLORS, SPACING } from "@/constants/theme";
import {
  ExpoBackgroundRemoverView,
  OnLoadEventPayload,
  OnProcessingCompleteEventPayload,
  OnSubjectLiftedEventPayload,
} from "@/modules/expo-background-remover";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

// This screen displays the Swift VisionKit interface for background removal
export default function VisionKitRemoval() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  // State to hold the URI of the image with background removed
  const [backgroundRemovedImageURI, setBackgroundRemovedImageURI] =
    React.useState<string | null>(null);

  const handleLoad = (event: { nativeEvent: OnLoadEventPayload }) => {
    console.log("VisionKit loaded:", event.nativeEvent);
    const { status, imageSize } = event.nativeEvent;
    if (status === "loaded" && imageSize) {
      Alert.alert(
        "Image Loaded",
        `Image loaded successfully! Size: ${imageSize.width}x${imageSize.height}`
      );
    }
  };


  // const handleProcessingComplete = (event: {
  //   nativeEvent: OnProcessingCompleteEventPayload;
  // }) => {
  //   console.log("Processing complete:", event.nativeEvent);
  //   const { success, hasProcessedImage, processedImageUri, method } =
  //     event.nativeEvent;
  //   if (success && hasProcessedImage && processedImageUri) {
  //     setBackgroundRemovedImageURI(processedImageUri);
  //     Alert.alert(
  //       "Processing Complete",
  //       `Background removal completed using: ${method}`
  //     );
  //   }
  // };

  const handleSubjectLifted = (event: {
    nativeEvent: OnSubjectLiftedEventPayload;
  }) => {
    console.log("Subject lifted:", event.nativeEvent);
    const { success, point } = event.nativeEvent;
    if (success) {
      Alert.alert(
        "Subject Extracted",
        `Subject successfully extracted at point (${Math.round(point.x)}, ${Math.round(point.y)})`
      );
    }
  };

  if (!imageUri) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No image provided</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VisionKit Background Removal</Text>
      {/* Only render the image if the URI is available */}
      {backgroundRemovedImageURI && (
        <Image
          source={{ uri: backgroundRemovedImageURI }}
          style={styles.visionKitView}
        />
      )}
      {/* <ExpoBackgroundRemoverView
        imageUri={imageUri}
        style={styles.visionKitView}
        onLoad={handleLoad}
        onProcessingComplete={handleProcessingComplete}
        onSubjectLifted={handleSubjectLifted}
      /> */}
    </View>
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
  visionKitView: {
    flex: 1,
    borderRadius: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryBackground,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textPrimary,
  },
});
