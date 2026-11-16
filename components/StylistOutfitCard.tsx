import { api } from "@/convex/_generated/api";
import { COLORS } from "@/constants/theme";
import type { OutfitItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StylistOutfitCard({ outfit, disabled, saving, saved, onSave, onDislike, onAnother }: {
  outfit: OutfitItem; disabled: boolean; saving: boolean; saved: boolean;
  onSave: () => void; onDislike: () => void; onAnother: () => void;
}) {
  const items = useQuery(api.items.getOutfitItemsFromAi, {
    ...(outfit.top && { top: outfit.top }), ...(outfit.bottom && { bottom: outfit.bottom }),
    ...(outfit.fullBody && { fullBody: outfit.fullBody }), ...(outfit.shoes && { shoes: outfit.shoes }),
    ...(outfit.outerwear && { outerwear: outfit.outerwear }), ...(outfit.accessories && { accessories: outfit.accessories }),
  });
  const garments = items ? [items.top, items.bottom, items.fullBody, items.shoes, items.outerwear, ...items.accessories].filter(item => item !== null) : [];
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="shirt-outline" size={16} color={COLORS.accent} />
        <Text style={styles.eyebrow}>FROM YOUR CLOSET</Text>
      </View>
      {!items ? <ActivityIndicator style={styles.loader} color={COLORS.accent} /> : (
        <View style={styles.grid}>
          {garments.map(item => (
            <View key={item._id} style={styles.garment}>
              <Image source={{ uri: item.imageUrl }} style={styles.photo} contentFit="contain" accessibilityLabel={`${item.color ?? ""} ${item.subcategory}`} />
              <Text numberOfLines={1} style={styles.garmentName}>{item.subcategory}</Text>
              <Text numberOfLines={1} style={styles.color}>{item.color || item.category}</Text>
            </View>
          ))}
          {!garments.length && <Text style={styles.color}>These items are no longer in your closet.</Text>}
        </View>
      )}
      <TouchableOpacity accessibilityRole="button" style={[styles.save, (disabled || saved) && styles.muted]} onPress={onSave} disabled={disabled || saved}>
        {saving ? <ActivityIndicator size="small" color="white" /> : <Ionicons name={saved ? "heart" : "heart-outline"} size={18} color="white" />}
        <Text style={styles.saveText}>{saving ? "Saving…" : saved ? "Saved to your outfits" : "Save outfit"}</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity accessibilityRole="button" style={styles.action} onPress={onDislike} disabled={disabled}>
          <Ionicons name="thumbs-down-outline" size={16} color={disabled ? COLORS.textDisabled : COLORS.textSecondary} />
          <Text style={styles.actionText}>Not my style</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.action} onPress={onAnother} disabled={disabled}>
          <Ionicons name="refresh-outline" size={16} color={disabled ? COLORS.textDisabled : COLORS.textSecondary} />
          <Text style={styles.actionText}>Try another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, backgroundColor: COLORS.pureWhite, borderWidth: 1, borderColor: COLORS.border, marginTop: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: "700", color: COLORS.accent },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  garment: { width: "47%", paddingBottom: 8 },
  photo: { width: "100%", height: 124, backgroundColor: COLORS.surface, borderRadius: 12 },
  garmentName: { color: COLORS.textPrimary, fontWeight: "600", fontSize: 13, marginTop: 8 },
  color: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 },
  save: { backgroundColor: COLORS.accent, paddingVertical: 13, borderRadius: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 },
  saveText: { color: "white", fontSize: 14, fontWeight: "600" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  action: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, minHeight: 44 },
  actionText: { color: COLORS.textSecondary, fontSize: 12 },
  loader: { padding: 40 }, muted: { opacity: 0.55 },
});
