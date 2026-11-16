import GeneratedOutfitsCanvas from "@/components/GeneratedOutfitsCanvas";
import { LoadingSpinner, Button } from "@/components/ui";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { OutfitItem } from "@/types";
import { ErrorHandler, Logger } from "@/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

export default function AiGenerateOutfit() {
  const { selectedIds, occasion, weather } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Hooks
  const getItems = useQuery(api.items.getItemsForGenerateOutfit);
  const generateOutfit = useAction(api.generateOutfits.analyzeOutfit);
  const saveOutfit = useMutation(api.outfits.saveOutfit);

  // State
  const [outfitResult, setOutfitResult] = useState<Partial<OutfitItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Memoized values
  const selectedIdsArray = useMemo(() => {
    return typeof selectedIds === "string" ? selectedIds.split(",") : [];
  }, [selectedIds]);

  const handleSaveOutfit = useCallback(async () => {
    if (!outfitResult?.top || !outfitResult?.bottom) {
      Alert.alert("Error", "Cannot save incomplete outfit");
      return;
    }

    try {
      const outfitData: OutfitItem = {
        top: outfitResult.top,
        bottom: outfitResult.bottom,
        ...(outfitResult.shoes && { shoes: outfitResult.shoes }),
        ...(outfitResult.outerwear && { outerwear: outfitResult.outerwear }),
        ...(outfitResult.accessories?.length && { accessories: outfitResult.accessories }),
        ...(outfitResult.fullBody && { fullBody: outfitResult.fullBody }),
      };

      await saveOutfit(outfitData);
      Alert.alert("Success", "Outfit saved successfully!");
      Logger.info('Outfit saved successfully', { outfitData });
    } catch (error) {
      Logger.error('Failed to save outfit', error);
      const zwagError = ErrorHandler.handleAIGenerationError(error);
      Alert.alert("Error", zwagError.message);
    }
  }, [outfitResult, saveOutfit]);

  const parseAIResponse = useCallback((result: any) => {
    if (typeof result === "string") {
      try {
        const parsed = JSON.parse(result);
        // Clean up response - only include valid, non-empty values
        return Object.entries(parsed).reduce((acc, [key, value]) => {
          if (value && typeof value === "string" && value.trim() !== "") {
            acc[key] = value;
          }
          return acc;
        }, {} as any);
      } catch {
        throw new Error("Invalid AI response format");
      }
    }
    return result;
  }, []);

  const generateOutfitData = useCallback(async () => {
    if (!getItems?.length) return null;

    const result = await generateOutfit({
      items: getItems.map((item) => ({ ...item, color: item.color ?? "" })),
      preferredItemsId: selectedIdsArray,
      occasion: occasion as string,
      weather: weather as string,
    });

    return parseAIResponse(result);
  }, [getItems, generateOutfit, selectedIdsArray, occasion, weather, parseAIResponse]);

  const handleRegenerateOutfit = useCallback(async () => {
    try {
      setRegenerating(true);
      setError(null);
      const result = await generateOutfitData();
      setOutfitResult(result);
      Logger.info('Outfit regenerated successfully');
    } catch (error) {
      Logger.error('Failed to regenerate outfit', error);
      const zwagError = ErrorHandler.handleAIGenerationError(error);
      setError(zwagError.message);
    } finally {
      setRegenerating(false);
    }
  }, [generateOutfitData]);

  useEffect(() => {
    const fetchOutfit = async () => {
      if (!getItems?.length) return;

      try {
        setLoading(true);
        setError(null);
        const result = await generateOutfitData();
        setOutfitResult(result);
        Logger.info('Initial outfit generated successfully');
      } catch (error) {
        Logger.error('Failed to generate initial outfit', error);
        const zwagError = ErrorHandler.handleAIGenerationError(error);
        setError(zwagError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [getItems, generateOutfitData]);

  // Calculate available space for content
  const headerHeight = 60;
  const buttonHeight = 120; // Space for both buttons
  const spacing = SPACING.md;
  const availableHeight =
    screenHeight -
    insets.top -
    insets.bottom -
    headerHeight -
    buttonHeight -
    spacing;

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

      {/* Main Content Area - Takes up remaining space */}
      <View style={[styles.contentArea, { maxHeight: availableHeight }]}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.textPrimary} />
            <Text style={styles.statusText}>
              Generating your perfect outfit...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={COLORS.error || "red"}
            />
            <Text style={[styles.statusText, { color: COLORS.error || "red" }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRegenerateOutfit}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : outfitResult ? (
          <GeneratedOutfitsCanvas
            item={{
              top: outfitResult.top as Id<"items">,
              bottom: outfitResult.bottom as Id<"items">,
              ...(outfitResult.shoes && { shoes: outfitResult.shoes as Id<"items"> }),
              ...(outfitResult.outerwear && outfitResult.outerwear !== "" && { 
                outerwear: outfitResult.outerwear as Id<"items"> 
              }),
              ...(outfitResult.accessories && outfitResult.accessories.length > 0 && { 
                accessories: outfitResult.accessories 
              }),
              ...(outfitResult.fullBody && outfitResult.fullBody !== "" && { 
                fullBody: outfitResult.fullBody as Id<"items"> 
              }),
            }}
          />
        ) : (
          <View style={styles.centerContent}>
            <Text style={styles.statusText}>No outfit generated yet</Text>
          </View>
        )}
      </View>

      {/* Bottom Buttons - Fixed at bottom */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom + SPACING.sm },
        ]}
      >
        {/* Regenerate Button */}
        {outfitResult && (
          <TouchableOpacity
            style={[styles.regenerateButton]}
            onPress={handleRegenerateOutfit}
            disabled={regenerating}
          >
            {regenerating ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={20}
                color={COLORS.textPrimary}
              />
            )}
            <Text style={styles.regenerateButtonText}>
              {regenerating ? "Generating..." : "Try Another"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !outfitResult && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveOutfit}
          disabled={!outfitResult}
        >
          <Ionicons name="heart-outline" size={20} color={COLORS.pureWhite} />
          <Text style={styles.saveButtonText}>Save Outfit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: SPACING.md,
    width: 40,
    height: 40,
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: "contain",
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  retryButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  retryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  bottomContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryBackground,
  },
  regenerateButton: {
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  regenerateButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  saveButton: {
    backgroundColor: COLORS.textPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
    ...SHADOWS.md,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
