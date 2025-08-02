import { COLORS } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CacheStatsProps {
  cacheStats: {
    itemCount: number;
    lastUpdate: number;
    isCacheHit: boolean;
    cacheAge: number;
  };
  visible?: boolean;
}

export default function CacheStatsIndicator({
  cacheStats,
  visible = false,
}: CacheStatsProps) {
  if (!visible || __DEV__ === false) return null;

  const formatCacheAge = (ageMs: number) => {
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cache Stats (Debug)</Text>
      <Text style={styles.stat}>Items: {cacheStats.itemCount}</Text>
      <Text style={styles.stat}>
        Status: {cacheStats.isCacheHit ? "🟢 Cache Hit" : "🔵 Fresh Data"}
      </Text>
      <Text style={styles.stat}>
        Age: {formatCacheAge(cacheStats.cacheAge)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    right: 10,
    backgroundColor: COLORS.overlay,
    padding: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stat: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
});
