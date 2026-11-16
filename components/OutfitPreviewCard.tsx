import { COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Canvas,
  Image as SkiaImage,
  useCanvasRef,
  useImage,
} from "@shopify/react-native-skia";
import { useQuery } from "convex/react";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type OutfitPreviewCardProps = {
  top?: Id<"items"> | undefined;
  bottom?: Id<"items"> | undefined;
  shoes?: Id<"items"> | undefined;
  outerwear?: Id<"items"> | undefined;
  accessories?: Id<"items">[] | undefined;
  fullBody?: Id<"items"> | undefined;
  onPress?: () => void;
};

export default function OutfitPreviewCard({
  top,
  bottom,
  shoes,
  outerwear,
  accessories,
  fullBody,
  onPress,
}: OutfitPreviewCardProps) {
  const ref = useCanvasRef();

  // Query all items by ID using your Convex function
  const outfitItemIds = {
    ...(top && { top }), ...(bottom && { bottom }), ...(fullBody && { fullBody }),
    ...(shoes && { shoes }), ...(outerwear && { outerwear }), ...(accessories && { accessories }),
  };

  const items = useQuery(api.items.getOutfitItemsFromAi, outfitItemIds);

  // Helper function to get safe image URL with better optimization
  const getSafeImageUrl = (url?: string) => {
    if (!url || url.trim() === "") return "";
    // Add image optimization parameters if using a CDN like Cloudinary
    return url;
  };

  // Load images using Skia's useImage hook
  const topImg = useImage(getSafeImageUrl(items?.top?.imageUrl));
  const bottomImg = useImage(getSafeImageUrl(items?.bottom?.imageUrl));
  const fullBodyImg = useImage(getSafeImageUrl(items?.fullBody?.imageUrl));
  const shoesImg = useImage(getSafeImageUrl(items?.shoes?.imageUrl));
  const outerwearImg = useImage(getSafeImageUrl(items?.outerwear?.imageUrl));
  // For accessories, always call a fixed number of useImage hooks to avoid hook order errors
  const MAX_ACCESSORIES = 5;
  const accessoriesArr = (items?.accessories ?? []).slice(0, MAX_ACCESSORIES);

  const accessoriesImgs = [
    useImage(getSafeImageUrl(accessoriesArr[0]?.imageUrl)),
    useImage(getSafeImageUrl(accessoriesArr[1]?.imageUrl)),
    useImage(getSafeImageUrl(accessoriesArr[2]?.imageUrl)),
    useImage(getSafeImageUrl(accessoriesArr[3]?.imageUrl)),
    useImage(getSafeImageUrl(accessoriesArr[4]?.imageUrl)),
  ];

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
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.canvasWrapper}>
        <Canvas style={styles.canvas} ref={ref}>
          {fullBodyImg && <SkiaImage image={fullBodyImg} x={!outerwearImg ? 50 : 14} y={8} width={60} height={140} fit="contain" />}
          {/* Top clothing item */}
          {topImg && (
            <SkiaImage
              image={topImg}
              x={!outerwearImg ? 50 : 14} // Center if no outerwear, otherwise position left
              y={8}
              width={60}
              height={60}
              fit={"contain"}
            />
          )}

          {/* Bottom clothing item */}
          {bottomImg && (
            <SkiaImage
              image={bottomImg}
              x={!outerwearImg ? 50 : 14} // Center if no outerwear, otherwise position left
              y={70}
              width={60}
              height={80}
              fit={"contain"}
            />
          )}

          {/* Shoes */}
          {shoesImg && (
            <SkiaImage
              image={shoesImg}
              x={!outerwearImg ? 58 : 22} // Center if no outerwear, otherwise position left
              y={155}
              width={45}
              height={35}
              fit={"contain"}
            />
          )}

          {/* Outerwear */}
          {outerwearImg && (
            <SkiaImage
              image={outerwearImg}
              x={75}
              y={8}
              width={60}
              height={60}
              fit={"contain"}
            />
          )}

          {/* Accessories (multiple) */}
          {accessoriesImgs.map((img, idx) =>
            img ? (
              <SkiaImage
                key={idx}
                image={img}
                x={80 + idx * 20}
                y={75}
                width={25}
                height={25}
                fit={"contain"}
              />
            ) : null
          )}
        </Canvas>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    maxWidth: "50%", // Ensure it takes only half the screen width for 2-column layout
  },
  canvasWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  canvas: {
    width: 160, // Reduced width to fit 2 columns
    height: 200, // Reduced height proportionally
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
