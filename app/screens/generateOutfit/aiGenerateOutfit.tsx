import GeneratedOutfitsCanvas from "@/components/GeneratedOutfitsCanvas";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { GeneratedOutfit } from "@/convex/generateOutfits";
import { ConvexError } from "convex/values";
import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");
const eventId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const messageFor = (error: unknown) => error instanceof ConvexError && typeof error.data === "string"
  ? error.data : "Couldn't finish this request. Please try again.";
type Suggestion = GeneratedOutfit & { historyId: Id<"outfitHistory"> };

export default function AiGenerateOutfit() {
  const params = useLocalSearchParams<{ selectedIds?: string; occasion?: string; weather?: string }>();
  const preferred = typeof params.selectedIds === "string" ? params.selectedIds : "";
  const occasion = typeof params.occasion === "string" ? params.occasion : "";
  const weather = typeof params.weather === "string" ? params.weather : "Sunny";
  const insets = useSafeAreaInsets();
  const generateOutfit = useAction(api.generateOutfits.analyzeOutfit);
  const recordShown = useMutation(api.outfitHistory.recordShown);
  const logFeedback = useMutation(api.outfitHistory.logFeedback);
  const saveOutfit = useMutation(api.outfits.saveOutfit);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const outfitResult = suggestion?.outfit;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  // Generate an outfit from the selected items and context, then record it before display.
  const requestSuggestion = useCallback(async (): Promise<Suggestion> => {
    const result = await generateOutfit({ preferredItemsId: preferred.split(",").filter(Boolean), occasion, weather });
    if (!mounted.current) throw new Error("Generation screen closed");
    // Persist only accepted results, immediately before displaying them. A duplicate
    // or stale/deleted item is rejected transactionally before it can be shown.
    const historyId = await recordShown({ ...result, eventId: eventId() });
    return { ...result, historyId };
  }, [generateOutfit, recordShown, preferred, occasion, weather]);

  // Reuse the initial request across Strict Mode effect setup/cleanup. Closet or
  // history subscriptions must never trigger extra automatic generations.
  const initial = useRef<{ key: string; promise: Promise<Suggestion> } | null>(null);
  const requestKey = JSON.stringify([preferred, occasion, weather]);
  useEffect(() => {
    let active = true;
    busy.current = true;
    setLoading(true);
    setError(null);
    setSuggestion(null);
    if (initial.current?.key !== requestKey) initial.current = { key: requestKey, promise: requestSuggestion() };
    initial.current.promise.then(result => { if (active) setSuggestion(result); })
      .catch(error => { if (active) setError(messageFor(error)); })
      .finally(() => { if (active) { busy.current = false; setLoading(false); } });
    return () => { active = false; };
  }, [requestKey, requestSuggestion]);

  // Handle another 
  const handleAnother = useCallback(async (action: "try_another" | "dislike") => {
    if (busy.current) return;
    busy.current = true;
    setRegenerating(true);
    try {
      if (suggestion) await logFeedback({ historyId: suggestion.historyId, action, eventId: eventId() });
      const next = await requestSuggestion();
      if (mounted.current) { setSuggestion(next); setError(null); }
    } catch (error) {
      if (mounted.current) {
        if (suggestion) Alert.alert("No new outfit", messageFor(error));
        else setError(messageFor(error));
      }
    } finally {
      busy.current = false;
      if (mounted.current) setRegenerating(false);
    }
  }, [suggestion, logFeedback, requestSuggestion]);
  const handleRegenerateOutfit = useCallback(() => handleAnother("try_another"), [handleAnother]);

  const handleSaveOutfit = useCallback(async () => {
    if (!suggestion || busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await saveOutfit({ historyId: suggestion.historyId, eventId: eventId() });
      if (mounted.current) Alert.alert("Saved", "Outfit saved to your collection.");
    } catch (error) {
      if (mounted.current) Alert.alert("Couldn't save outfit", messageFor(error));
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
    }
  }, [suggestion, saveOutfit]);
  const controlsDisabled = loading || regenerating || saving;

  // Calculate available space for content
  const headerHeight = 60;
  const buttonHeight = 180; // Space for Try Another, Dislike, and Save
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
              disabled={controlsDisabled}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : outfitResult ? (
          <GeneratedOutfitsCanvas item={outfitResult} />
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
            disabled={controlsDisabled}
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

        {outfitResult && (
          <TouchableOpacity style={styles.regenerateButton} onPress={() => handleAnother("dislike")} disabled={controlsDisabled}>
            <Ionicons name="thumbs-down-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.regenerateButtonText}>Dislike</Text>
          </TouchableOpacity>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !outfitResult && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveOutfit}
          disabled={!outfitResult || controlsDisabled}
        >
          <Ionicons name="heart-outline" size={20} color={COLORS.pureWhite} />
          <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Outfit"}</Text>
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
