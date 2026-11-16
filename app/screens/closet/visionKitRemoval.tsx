import { COLORS, SPACING } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { VisionBgRemoverView } from "vision-bg-remover";
import type { ProcessingCompleteEventPayload, ProcessingErrorEventPayload } from "vision-bg-remover";

export default function VisionKitRemoval() {
  const params = useLocalSearchParams<{ imageUri?: string | string[] }>();
  const imageUri = Array.isArray(params.imageUri) ? params.imageUri[0] : params.imageUri;
  const [attempt, setAttempt] = useState(0);
  return <RemovalAttempt key={`${imageUri}:${attempt}`} imageUri={imageUri} onRetry={() => setAttempt(value => value + 1)} />;
}

function RemovalAttempt({ imageUri, onRetry }: { imageUri: string | undefined; onRetry: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    if (!imageUri) return;
    const timeout = setTimeout(() => {
      if (!finished.current) {
        finished.current = true;
        setError("Background removal took too long. Try again or choose another photo.");
      }
    }, 30000);
    return () => {
      finished.current = true;
      clearTimeout(timeout);
    };
  }, [imageUri]);

  const onProcessingError = useCallback(({ nativeEvent }: { nativeEvent: ProcessingErrorEventPayload }) => {
    if (finished.current) return;
    finished.current = true;
    setError(nativeEvent.error.includes("Could not create inference context")
      ? "Background removal couldn't start on this device. Try on a physical iPhone with iOS 17 or later, or use the original photo."
      : nativeEvent.error);
  }, []);

  const onProcessingComplete = useCallback(({ nativeEvent }: { nativeEvent: ProcessingCompleteEventPayload }) => {
    if (finished.current) return;
    if (!nativeEvent.processedImageUri) {
      onProcessingError({ nativeEvent: { error: "No processed photo was returned. Please try again." } });
      return;
    }
    finished.current = true;
    router.replace({
      pathname: "/screens/closet/addedItem",
      params: { processedImageUri: nativeEvent.processedImageUri },
    });
  }, [onProcessingError]);

  return (
    <View style={styles.container}>
      {imageUri && !error && (
        <VisionBgRemoverView
          imageUri={imageUri}
          style={styles.processingView}
          onProcessingComplete={onProcessingComplete}
          onProcessingError={onProcessingError}
        />
      )}
      {imageUri && !error && <ActivityIndicator size="large" color={COLORS.textPrimary} />}
      <Text style={styles.title}>
        {!imageUri ? "No photo selected" : error ? "Couldn't remove the background" : "Removing background..."}
      </Text>
      <Text style={styles.subtitle}>
        {!imageUri ? "Go back and choose a clothing photo." : error || "Please wait a moment"}
      </Text>
      {imageUri && error && (
        <>
          <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {
            finished.current = true;
            router.replace({ pathname: "/screens/closet/addedItem", params: { processedImageUri: imageUri } });
          }}>
            <Text style={styles.buttonText}>Use Original Photo</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.subtitle}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBackground, justifyContent: "center", alignItems: "center", padding: SPACING.lg },
  processingView: { position: "absolute", width: 1, height: 1, opacity: 0 },
  title: { fontSize: 20, fontWeight: "600", color: COLORS.textPrimary, marginTop: SPACING.lg, textAlign: "center" },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: "center" },
  button: { backgroundColor: COLORS.textPrimary, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: 8, marginTop: SPACING.lg },
  buttonText: { color: COLORS.pureWhite, fontSize: 16, fontWeight: "bold" },
  backButton: { padding: SPACING.md },
});
