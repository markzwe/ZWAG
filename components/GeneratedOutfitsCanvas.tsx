import { COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ItemViewDetailModalForGenerateOutfit from "@/modals/ItemViewDetailModalForGenerateOutfit";
import {
  Canvas,
  Image as SkiaImage,
  useCanvasRef,
  useImage,
} from "@shopify/react-native-skia";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type GeneratedOutfitsCanvasProps = {
  item: {
    top: Id<"items">;
    bottom: Id<"items">;
    shoes?: Id<"items">;
    outerwear?: Id<"items">;
    accessories?: Id<"items">[];
    fullBody?: Id<"items">;
  };
 
};

export default function GeneratedOutfitsCanvas({
  item,
}: GeneratedOutfitsCanvasProps) {
  const ref = useCanvasRef();

  const CANVAS_WIDTH = 350;
  const CANVAS_HEIGHT = 500;

  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max));
  }

  // Query all items by ID using your Convex function
  const outfitItemIds = {
    top: item.top ? (item.top as Id<"items">) : undefined,
    bottom: item.bottom ? (item.bottom as Id<"items">) : undefined,
    shoes: item.shoes ? (item.shoes as Id<"items">) : undefined,
    outerwear: item.outerwear ? (item.outerwear as Id<"items">) : undefined,
    accessories: Array.isArray(item.accessories)
      ? item.accessories[0] // Only pass the first accessory to the query
      : item.accessories
        ? (item.accessories as Id<"items">)
        : undefined,
  };

  const items = useQuery(api.items.getOutfitItemsFromAi, outfitItemIds);
  const outfit = useMutation(api.outfits.saveOutfit)

    

  // Load images using Skia's useImage hook
  const topImg = useImage(items?.top?.imageUrl ?? "");
  const bottomImg = useImage(items?.bottom?.imageUrl ?? "");
  const shoesImg = useImage(items?.shoes?.imageUrl ?? "");
  const outerwearImg = useImage(items?.outerwear?.imageUrl ?? "");
  // For accessories, always call a fixed number of useImage hooks to avoid hook order errors
  const MAX_ACCESSORIES = 5;
  const accessoriesArr = Array.isArray(items?.accessories)
    ? items.accessories.slice(0, MAX_ACCESSORIES)
    : items?.accessories
      ? [items.accessories]
      : [];

  const accessoriesImgs = [
    useImage(accessoriesArr[0]?.imageUrl ?? ""),
    useImage(accessoriesArr[1]?.imageUrl ?? ""),
    useImage(accessoriesArr[2]?.imageUrl ?? ""),
    useImage(accessoriesArr[3]?.imageUrl ?? ""),
    useImage(accessoriesArr[4]?.imageUrl ?? ""),
  ];

  const [itemDetailVisible, setItemDetailVisible] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  // Function to get the selected item ID based on the selected item type
  // This is used to pass the correct item ID to the ItemViewDetailModalForGenerateOutfit
  // so that it can fetch the correct item details from the database
  // and display them in the modal.
  const getSelectedItemId = () => {
    if (!selectedItem || !items) return null;

    switch (selectedItem) {
      case "top":
        return items.top?._id;
      case "bottom":
        return items.bottom?._id;
      case "shoes":
        return items.shoes?._id;
      case "outerwear":
        return items.outerwear?._id;
      case "accessories":
        return items.accessories?._id;
      default:
        return null;
    }
  };

  // Wait for DB query - return loading state AFTER calling all hooks
  if (!items) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.darkGray} />
        <Text style={styles.loadingText}>Loading outfit...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.canvasWrapper}>
        <Canvas style={styles.canvas} ref={ref}>
          {/* Top clothing item */}
          {topImg && (
            <SkiaImage
              image={topImg}
              x={15}
              y={15}
              width={130}
              height={130}
              fit={"contain"}
            />
          )}

          {/* Bottom clothing item */}
          {bottomImg && (
            <SkiaImage
              image={bottomImg}
              x={15}
              y={150}
              width={130}
              height={180}
              fit={"contain"}
            />
          )}

          {/* Shoes */}
          {shoesImg && (
            <SkiaImage
              image={shoesImg}
              x={25}
              y={340}
              width={100}
              height={80}
              fit={"contain"}
            />
          )}

          {/* Outerwear */}
          {outerwearImg && (
            <SkiaImage
              image={outerwearImg}
              x={160}
              y={15}
              width={130}
              height={130}
              fit={"contain"}
            />
          )}

          {/* Accessories (multiple) */}
          {accessoriesImgs.map((img, idx) =>
            img ? (
              <SkiaImage
                key={idx}
                image={img}
                x={175 + idx * 45}
                y={160}
                width={50}
                height={50}
                fit={"contain"}
              />
            ) : null
          )}
        </Canvas>
      </View>

      {/* Preview section below canvas */}
      <View style={styles.previewSection}>
        <FlatList
          data={[
            { label: "Top", url: items?.top?.imageUrl },
            { label: "Bottom", url: items?.bottom?.imageUrl },
            { label: "Shoes", url: items?.shoes?.imageUrl },
            { label: "Outerwear", url: items?.outerwear?.imageUrl },
            // Accessories: push all accessory images as separate preview cards
            ...(Array.isArray(items?.accessories)
              ? items.accessories.map((acc: any, idx: number) => ({
                  label: `Accessory ${idx + 1}`,
                  url: acc?.imageUrl,
                }))
              : items?.accessories
                ? [{ label: "Accessory", url: items.accessories?.imageUrl }]
                : []),
          ].filter((item) => !!item.url)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.previewCard}
              onPress={() => {
                setItemDetailVisible(true);
                setSelectedItem(item.label.toLowerCase());
              }}
            >
              <Image
                source={{ uri: item.url }}
                style={styles.previewImage}
                contentFit="contain"
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => `${item.label}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemPreview}
        />
        {/* View detail modal */}
        {getSelectedItemId() && (
          <ItemViewDetailModalForGenerateOutfit
            itemId={getSelectedItemId() as Id<"items">}
            visible={itemDetailVisible}
            onClose={() => setItemDetailVisible(false)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
  canvasWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  canvas: {
    width: 350,
    height: 440,
    backgroundColor: COLORS.imageBackground,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryBackground,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  previewSection: {
    width: "100%",
    borderRadius: 16,
    marginVertical: SPACING.sm,
  },
  itemPreview: {
    paddingHorizontal: SPACING.sm,
    gap: SPACING.md,
    alignItems: "center",
  },
  previewCard: {
    backgroundColor: COLORS.surface, // Fixed the invalid color value "CC"
    borderRadius: 16,
    padding: SPACING.xs,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.imageBackground,
  },
  previewLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: SPACING.xs,
  },
});
