import Header from "@/components/Header";
import OutfitPreviewCard from "@/components/OutfitPreviewCard";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Recents() {
  const insets = useSafeAreaInsets();
  const outfits = useQuery(api.outfits.getOutfits);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header />
        {/* Outfit Preview Card */}
        <FlatList
          showsVerticalScrollIndicator={false}
          data={outfits}
          keyExtractor={(item) => item._id}
          renderItem={
            ({ item }) => 
            <OutfitPreviewCard
              top={item.top}
              bottom={item.bottom}
              shoes={item.shoes}
              outerwear={item.outerwear}
              accessories={item.accessories}
              fullBody={item.fullBody}
            />
          } 
        />
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  text: {
    fontSize: 20,
    color: "#333",
  },
});
