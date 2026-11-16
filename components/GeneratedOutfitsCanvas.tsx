import { COLORS, SPACING } from "@/constants/theme";
import { UI_CONSTANTS, TEXT_CONSTANTS } from "@/constants/app";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { OutfitItem, PreviewItem } from "@/types";
import { Logger } from "@/utils/errorHandler";
import ItemViewDetailModalForGenerateOutfit from "@/modals/ItemViewDetailModalForGenerateOutfit";
import {
  Canvas,
  Image as SkiaImage,
  useCanvasRef,
  useImage,
} from "@shopify/react-native-skia";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GeneratedOutfitsCanvasProps {
  item: OutfitItem;
}

export default function GeneratedOutfitsCanvas({
  item,
}: GeneratedOutfitsCanvasProps) {
  const ref = useCanvasRef();


  // Query all items by ID using your Convex function
  const outfitItemIds = useMemo(() => {
    return {
      ...(item.top && { top: item.top }), ...(item.bottom && { bottom: item.bottom }),
      ...(item.fullBody && { fullBody: item.fullBody }), ...(item.shoes && { shoes: item.shoes }),
      ...(item.outerwear && { outerwear: item.outerwear }), ...(item.accessories && { accessories: item.accessories }),
    };
  }, [item]);

  const items = useQuery(api.items.getOutfitItemsFromAi, outfitItemIds);

  // Helper function to get safe image URL with better optimization
  const getSafeImageUrl = useCallback((url?: string): string => {
    if (!url || url.trim() === "") return "";
    // Add image optimization parameters if using a CDN like Cloudinary
    return url;
  }, []);

  // Load images using Skia's useImage hook
  const topImg = useImage(getSafeImageUrl(items?.top?.imageUrl));
  const bottomImg = useImage(getSafeImageUrl(items?.bottom?.imageUrl));
  const fullBodyImg = useImage(getSafeImageUrl(items?.fullBody?.imageUrl));
  const shoesImg = useImage(getSafeImageUrl(items?.shoes?.imageUrl));
  const outerwearImg = useImage(getSafeImageUrl(items?.outerwear?.imageUrl));
  // For accessories, always call a fixed number of useImage hooks to avoid hook order errors
  const accessoriesArr = useMemo(() => {
    return (items?.accessories ?? []).slice(0, UI_CONSTANTS.MAX_ACCESSORIES);
  }, [items?.accessories]);

  const accessoriesImgs = [
    useImage(getSafeImageUrl(accessoriesArr[0]?.imageUrl)),
    useImage(getSafeImageUrl(accessoriesArr[1]?.imageUrl)),
    useImage(getSafeImageUrl(accessoriesArr[2]?.imageUrl)),
    useImage(getSafeImageUrl(accessoriesArr[3]?.imageUrl)),
    useImage(getSafeImageUrl(accessoriesArr[4]?.imageUrl)),
  ];

  const [itemDetailVisible, setItemDetailVisible] = React.useState<boolean>(false);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  // Function to get the selected item ID based on the selected item type
  const getSelectedItemId = useCallback((): Id<"items"> | null => {
    if (!selectedItem || !items) return null;

    try {
      switch (selectedItem) {
        case "top":
          return items.top?._id || null;
        case "bottom":
          return items.bottom?._id || null;
        case "shoes":
          return items.shoes?._id || null;
        case "outerwear":
          return items.outerwear?._id || null;
        case "full body":
          return items.fullBody?._id || null;
        case "accessories":
          return items.accessories[0]?._id || null;
        default:
          if (selectedItem.startsWith("accessory")) return items.accessories[Number(selectedItem.split(" ")[1] ?? 1) - 1]?._id ?? null;
          return null;
      }
    } catch (error) {
      Logger.error("Failed to get selected item ID", error, { selectedItem });
      return null;
    }
  }, [selectedItem, items]);

  // Memoize preview data to prevent unnecessary recalculations
  const previewData = useMemo((): PreviewItem[] => {
    if (!items) return [];

    const baseItems: PreviewItem[] = [
      { label: "Top", url: items.top?.imageUrl || "" },
      { label: "Bottom", url: items.bottom?.imageUrl || "" },
      { label: "Full Body", url: items.fullBody?.imageUrl || "" },
      { label: "Shoes", url: items.shoes?.imageUrl || "" },
      { label: "Outerwear", url: items.outerwear?.imageUrl || "" },
    ];

    // Add accessories
    const accessoryItems: PreviewItem[] = items.accessories.map((acc, idx) => ({
      label: `Accessory ${idx + 1}`, url: acc.imageUrl,
    }));

    return [...baseItems, ...accessoryItems].filter((item) => !!item.url);
  }, [items]);

  // Wait for DB query - return loading state AFTER calling all hooks
  if (!items) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.darkGray} />
        <Text style={styles.loadingText}>{TEXT_CONSTANTS.LOADING.OUTFIT}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.canvasWrapper}>
        <Canvas style={styles.canvas} ref={ref}>
          {fullBodyImg && <SkiaImage image={fullBodyImg} x={!outerwearImg ? 110 : 15} y={15} width={130} height={315} fit="contain" />}
          {/* Top clothing item */}
          {topImg && (
            <SkiaImage
              image={topImg}
              x={!outerwearImg ? 110 : 15} // Center if no outerwear, otherwise position left
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
              x={!outerwearImg ? 110 : 15} // Center if no outerwear, otherwise position left
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
              x={!outerwearImg ? 125 : 25} // Center if no outerwear, otherwise position left
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
                x={!outerwearImg ? 75 + idx * 45 : 175 + idx * 45} // Center accessories if no outerwear
                y={!outerwearImg ? 430 : 160} // Position below shoes if no outerwear, otherwise right side
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
          data={previewData}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.previewCard}
              onPress={() => {
                try {
                  setItemDetailVisible(true);
                  setSelectedItem(item.label.toLowerCase());
                } catch (error) {
                  Logger.error("Failed to open item detail", error, { item: item.label });
                }
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
            itemId={getSelectedItemId()!}
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
    width: UI_CONSTANTS.CANVAS_DIMENSIONS.WIDTH,
    height: UI_CONSTANTS.CANVAS_DIMENSIONS.HEIGHT - 60, // Adjust for better fit
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
