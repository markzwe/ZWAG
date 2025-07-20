import Header from "@/components/Header";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Closet() {
  const insets = useSafeAreaInsets();
  const getImageUrls = useQuery(api.items.getPreviewImageByCategory);
  const countItems = useQuery(api.items.countItemsByCategory);

  // State to track current image index for each category
  const [currentImageIndices, setCurrentImageIndices] = useState<
    Record<string, number>
  >({});

  console.log("Count Items:", countItems);
  console.log("Image URLs:", getImageUrls);

  const CATEGORY_NAMES: Record<string, string> = {
    top: "Tops",
    bottom: "Bottoms",
    outerwear: "Outerwear",
    shoes: "Shoes",
    fullbody: "Full Body",
    accessories: "Accessories",
  };

  // Build categories array from live database data and filter out empty ones
  const categories = Object.entries(CATEGORY_NAMES)
    .map(([key, displayName]) => ({
      name: displayName,
      count: countItems?.[displayName] || 0,
      images:
        getImageUrls?.find((item) => item.category === displayName)?.images ||
        [],
    }))
    .filter((category) => category.count > 0); // Only show categories with items

  // Initialize image indices when data loads
  useEffect(() => {
    if (getImageUrls && getImageUrls.length > 0) {
      const initialIndices: Record<string, number> = {};
      getImageUrls.forEach((item) => {
        initialIndices[item.category] = 0;
      });
      setCurrentImageIndices(initialIndices);
    }
  }, [getImageUrls]);

  // Set up image rotation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndices((prevIndices) => {
        const newIndices = { ...prevIndices };

        categories.forEach((category) => {
          if (category.images.length > 1) {
            const currentIndex = prevIndices[category.name] || 0;
            newIndices[category.name] =
              (currentIndex + 1) % category.images.length;
          }
        });

        return newIndices;
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [categories]);

  // Get current image URL for a category
  const getCurrentImageUrl = (categoryName: string, images: string[]) => {
    if (images.length === 0) {
      // Fallback image if no images available
      return "https://i.ebayimg.com/images/g/gYkAAOSwaA5Wi0WK/s-l1200.jpg";
    }

    const currentIndex = currentImageIndices[categoryName] || 0;
    return images[currentIndex] || images[0];
  };

  const renderCategoryCard = (category: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.categoryCard,
        index % 2 === 0 ? styles.cardEven : styles.cardOdd,
      ]}
      onPress={() => {
        // Navigate to category screen
        console.log(`Navigate to ${category.name}`);
        router.push({
          pathname: "/screens/browseItems",
          params: { categoryName: category.name },
        });
      }}
    >
      {/* Dynamic Background Image from database */}
      <Image
        source={{
          uri: getCurrentImageUrl(category.name, category.images),
        }}
        style={styles.cardBackgroundImage}
        contentFit="contain"
        transition={300} // Smooth transition between images
      />
      <View style={styles.cardContent}>
        <View style={styles.categoryText}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <Text style={styles.categoryCount}>{category.count} items</Text>
        </View>
      </View>
      <View style={styles.cardAccent} />
    </TouchableOpacity>
  );

  const broweByCategories = () => {
    router.push("/screens/browseItems");
  };

  return (
    <View style={[{ paddingTop: insets.top }, styles.container]}>
      <Header />
      {categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptySubtitle}>
            Start building your closet by adding your first item!
          </Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => router.push("/screens/addItem")}
          >
            <Ionicons name="add" size={24} color={COLORS.pureWhite} />
            <Text style={styles.emptyAddButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.subtitle}>
                Organize and discover your style
              </Text>
            </View>

            {/* Browse All Section */}
            <TouchableOpacity
              style={styles.browseAllCard}
              onPress={() => router.push("/screens/browseItems")}
            >
              <View style={styles.browseAllContent}>
                <View style={styles.browseAllLeft}>
                  <Text style={styles.browseAllTitle}>
                    Browse All Items in Closet
                  </Text>
                  <Text style={styles.browseAllSubtitle}>
                    View your entire collection
                  </Text>
                </View>
                <View style={styles.browseAllIcon}>
                  <Ionicons
                    name="grid-outline"
                    size={28}
                    color={COLORS.textPrimary || "#1A1A1A"}
                  />
                </View>
              </View>
            </TouchableOpacity>
            {/* Add Button */}
            {categories.length > 0 && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/screens/addItem")}
              >
                <Ionicons
                  name="add"
                  size={28}
                  color={COLORS.pureWhite || "#FFFFFF"}
                />
                <Text
                  style={{
                    color: COLORS.pureWhite,
                    fontSize: FONT_SIZES.lg,
                    fontWeight: "600",
                  }}
                >
                  Add Item
                </Text>
              </TouchableOpacity>
            )}

            {/* Categories Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse By Categories</Text>
              <View style={styles.sectionLine} />
            </View>

            {/* Categories Grid */}
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) =>
                renderCategoryCard(category, index)
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING?.lg || 20,
    paddingBottom: 120,
  },

  // Header Section
  headerSection: {
    marginBottom: SPACING?.sm || 32,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },

  // Browse All Card
  browseAllCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  browseAllContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  browseAllLeft: {
    flex: 1,
  },
  browseAllTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  browseAllSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  browseAllIcon: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginRight: 16,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  categoryText: {
    padding: 12,
    alignItems: "flex-start",
    marginTop: 110, // Push text below the image
  },
  // Categories Grid
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: "48%",
    height: 200,
    borderRadius: 12,
    padding: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    overflow: "hidden",
    shadowColor: COLORS.darkGray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    justifyContent: "flex-end",
  },
  cardBackgroundImage: {
    position: "absolute",
    top: 10,
    left: "50%",
    width: 120,
    height: 120,
    opacity: 0.8, // Higher opacity since no text overlap
    zIndex: 0,
    transform: [{ translateX: -60 }],
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 1,
  },
  cardEven: {
    backgroundColor: COLORS.offWhite,
  },
  cardOdd: {
    backgroundColor: COLORS.offWhite,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 2,
    height: "100%",
    backgroundColor: COLORS.black,
    opacity: 0.6,
  },

  // Floating Add Button
  createButton: {
    backgroundColor: COLORS.black,
    width: "100%",
    height: 36,
    borderRadius: BORDER_RADIUS.apple,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    flexDirection: "row",
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.offWhite,
    borderRadius: 24,
    margin: 24,
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: COLORS.textPrimary,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  emptyAddButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
