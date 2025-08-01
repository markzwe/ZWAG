import GeneratedOutfitsCanvas from "@/components/GeneratedOutfitsCanvas";
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useAction, useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

export default function AiGenerateOutfit() {
  const { selectedIds, occasion, weather } = useLocalSearchParams();

  // Memoize the selectedIdsArray to prevent infinite loops
  const selectedIdsArray = React.useMemo(() => {
    return typeof selectedIds === "string" ? selectedIds.split(",") : [];
  }, [selectedIds]);

  const ref = useCanvasRef();
  const insets = useSafeAreaInsets();
  console.log("Selected IDs in AiGenerateOutfit:", selectedIdsArray);

  const getItems = useQuery(api.items.getItemsForGenerateOutfit);
  const generateOutfit = useAction(api.generateOutfits.analyzeOutfit);
  const saveOutfit = useMutation(api.outfits.saveOutfit);

  // Fixed type definition - accessories should be a single ID, not array
  type outfitResultType = {
    top?: Id<"items">;
    bottom?: Id<"items">;
    shoes?: Id<"items">;
    outerwear?: Id<"items">;
    accessories?: Id<"items">[]; // This should be array of IDs
    fullBody?: Id<"items">;
  };

  const [outfitResult, setOutfitResult] =
    React.useState<outfitResultType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [regenerating, setRegenerating] = React.useState(false);

  const handleSaveOutfit = async () => {
    if (!outfitResult) return;

    const outfitData = {
        top: outfitResult.top || ("" as Id<"items">),
        bottom: outfitResult.bottom || ("" as Id<"items">),
        shoes: outfitResult.shoes || undefined,
        outerwear: outfitResult.outerwear || undefined,
        accessories: Array.isArray(outfitResult.accessories)
          ? outfitResult.accessories
          : undefined,
        fullBody: outfitResult.fullBody ? outfitResult.fullBody : undefined,

    };

    try {
      await saveOutfit(outfitData);
      alert("Outfit saved successfully!");
    } catch (error) {
      console.error("Error saving outfit:", error);
      alert("Failed to save outfit. Please try again.");
    }
  };

  const handleRegenerateOutfit = async () => {
    if (!getItems || getItems.length === 0) return;

    setRegenerating(true);
    setError(null);

    try {
      const result = await generateOutfit({
        items: getItems.map((item) => ({
          ...item,
          color: item.color ?? "",
        })),
        preferredItemsId: selectedIdsArray,
        occasion: occasion as string,
        weather: weather as string,
      });

      let parsed = null;
      if (typeof result === "string") {
        try {
          parsed = JSON.parse(result);
          console.log("Parsed AI response:", parsed);
        } catch (e) {
          setError("AI response was not valid JSON");
          parsed = null;
        }
      } else {
        parsed = result;
      }
      setOutfitResult(parsed);
    } catch (err) {
      console.error("Error regenerating outfit:", err);
      setError("Failed to regenerate outfit");
    } finally {
      setRegenerating(false);
    }
  };

  React.useEffect(() => {
    const fetchOutfit = async () => {
      if (!getItems || getItems.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const result = await generateOutfit({
          items: getItems.map((item) => ({
            ...item,
            color: item.color ?? "",
          })),
          preferredItemsId: selectedIdsArray,
          occasion: occasion as string,
          weather: weather as string,
        });

        let parsed = null;
        if (typeof result === "string") {
          try {
            parsed = JSON.parse(result);
            console.log("Parsed AI response:", parsed);
          } catch (e) {
            setError("AI response was not valid JSON");
            parsed = null;
          }
        } else {
          parsed = result;
        }
        setOutfitResult(parsed);
      } catch (err) {
        console.error("Error generating outfit:", err);
        setError("Failed to generate outfit");
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [getItems, generateOutfit, selectedIdsArray, occasion, weather]);

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
              shoes: outfitResult.shoes as Id<"items">,
              outerwear:
                outfitResult.outerwear === ""
                  ? undefined
                  : (outfitResult.outerwear as Id<"items">),
              accessories: outfitResult.accessories,
              fullBody:
                outfitResult.fullBody === ""
                  ? undefined
                  : (outfitResult.fullBody as Id<"items">),
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
