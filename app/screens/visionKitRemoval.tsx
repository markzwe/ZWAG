import { COLORS, SPACING } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";

export default function VisionKitRemoval() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [backgroundRemovedImageURI, setBackgroundRemovedImageURI] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // useEffect(() => {
  //   if (!imageUri) {
  //     setError("No image provided");
  //     setLoading(false);
  //     return;
  //   }

  //   const processImage = async () => {
  //     try {
  //       const resultUri = await removeBg(imageUri);
  //       setBackgroundRemovedImageURI(resultUri as string);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : String(err));
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   processImage();
  // }, [imageUri]);

  // async function removeBg(imageUri: string) {
  //   const apiKey = "7C5HUh99oUAkaN9j9dp8kbeY";

  //   const formData = new FormData();
  //   formData.append("size", "auto");
  //   formData.append("image_file", {
  //     uri: imageUri,
  //     name: "image.jpg",
  //     type: "image/jpeg",
  //   });

  //   const response = await fetch("https://api.remove.bg/v1.0/removebg", {
  //     method: "POST",
  //     headers: {
  //       "X-Api-Key": apiKey,
  //     },
  //     body: formData,
  //   });

  //   if (!response.ok) {
  //     const errorText = await response.text();
  //     throw new Error(`Remove.bg failed: ${response.status} ${errorText}`);
  //   }

  //   const blob = await response.blob();
  //   const reader = new FileReader();

  //   return new Promise<string>((resolve, reject) => {
  //     reader.onloadend = async () => {
  //       try {
  //         const base64Data = reader.result!.toString().split(",")[1];
  //         const fileUri = FileSystem.documentDirectory + "no-bg.png";
  //         await FileSystem.writeAsStringAsync(fileUri, base64Data, {
  //           encoding: FileSystem.EncodingType.Base64,
  //         });
  //         resolve(fileUri);
  //       } catch (error) {
  //         reject(error);
  //       }
  //     };

  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob);
  //   });
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VisionKit Background Removal</Text>

      {loading && <ActivityIndicator size="large" color={COLORS.textPrimary} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {backgroundRemovedImageURI && (
        <Image
          source={{ uri: backgroundRemovedImageURI }}
          style={styles.visionKitView}
          resizeMode="contain"
        />
      )}
   
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() =>
            router.push({
              pathname: "/screens/addedItem",
              params: { processedImageUri: imageUri }, // Pass the original image URI for testing
            })
          }
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
  errorText: {
    fontSize: 16,
    color: "red",
    marginTop: 20,
    textAlign: "center",
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
  primaryActionButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});
