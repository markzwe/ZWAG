import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import React, { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

export default function AddItem() {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleOpenCamera = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera permissions to take photos!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
  };

  if (!selectedImage) {
    return (
      <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.primaryBackground}
        />

        {/* Header */}
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.circularBackButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.pureWhite} />
          </TouchableOpacity>
          <Text style={styles.screenHeaderTitle}>Add Item To Your Closet</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <Animated.View
          style={[
            styles.animatedContentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Main Upload Area */}
          <View style={styles.uploadScreenSection}>
            {/* <Text style={styles.uploadMainTitle}>Upload Your Item</Text>
            <Text style={styles.uploadInstructions}>
              Choose how you'd like to add your clothing item
            </Text> */}

            {/* Two Equal Buttons */}
            <View style={styles.verticalButtonContainer}>
              <TouchableOpacity
                style={styles.primaryUploadButton}
                onPress={handleOpenCamera}
                activeOpacity={0.8}
              >
                <View style={styles.uploadButtonIcon}>
                  <Ionicons
                    name="camera"
                    size={32}
                    color={COLORS.textPrimary}
                  />
                </View>
                <Text style={styles.uploadButtonText}>Open Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryUploadButton}
                onPress={handleImagePicker}
                activeOpacity={0.8}
              >
                <View style={styles.uploadButtonIcon}>
                  <Ionicons name="image" size={32} color={COLORS.textPrimary} />
                </View>
                <Text style={styles.uploadButtonText}>Open Photos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.primaryBackground}
      />

      {/* Header with Image Actions */}
      <View style={styles.imagePreviewHeader}>
        <TouchableOpacity
          style={styles.circularBackButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.imageActionButtonsContainer}>
          <TouchableOpacity
            style={styles.smallCircularActionButton}
            onPress={resetSelection}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallCircularActionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={20} color={COLORS.success} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Preview */}
      <View style={styles.imagePreviewContainer}>
        <Image
          source={{ uri: selectedImage }}
          style={styles.fullSizePreviewImage}
          contentFit="contain"
          transition={300}
        />
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActionsContainer}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() =>
            router.push({
              pathname: "/screens/closet/visionKitRemoval",
              params: { imageUri: selectedImage },
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.primaryActionButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.pureWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Container
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },

  // Navigation Header Section
  navigationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  circularBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.darkGray,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  screenHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  headerRightSpacer: {
    width: 44,
  },

  // Upload Screen Content
  animatedContentWrapper: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  uploadScreenSection: {
    flex: 1,
    alignItems: "center",
  },
  uploadMainTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  uploadInstructions: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl * 2,
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },

  // Upload Buttons Section
  verticalButtonContainer: {
    flexDirection: "column",
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    width: "100%",
  },
  primaryUploadButton: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: BORDER_RADIUS.lg * 2,
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    width: "100%",
    ...SHADOWS.md,
  },
  uploadButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },

  // Unused Alternative Options (keeping for reference)
  uploadButtonSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  alternativeOptionsSection: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: "500",
  },
  secondaryUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  secondaryUploadButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  // Image Preview Screen Header
  imagePreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.pureWhite,
    ...SHADOWS.sm,
  },
  imageActionButtonsContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  smallCircularActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  // Image Preview Section
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  fullSizePreviewImage: {
    width: "100%",
    height: "100%",
  },

  // Bottom Actions Section
  bottomActionsContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.pureWhite,
    ...SHADOWS.lg,
  },
  primaryActionButton: {
    backgroundColor: COLORS.black,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  primaryActionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.pureWhite,
  },
});
