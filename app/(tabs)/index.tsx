import Header from "@/components/Header";
import { Button, Card, EmptyState } from "@/components/ui";
import { BORDER_RADIUS, COLORS, SPACING } from "@/constants/theme";
import { CLOTHING_CATEGORIES, TEXT_CONSTANTS, UI_CONSTANTS, ROUTES } from "@/constants/app";
import { api } from "@/convex/_generated/api";
import { useImageRotation } from "@/hooks/useImageRotation";
import { CategoryPreview } from "@/types";
import { Logger } from "@/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
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

  Logger.debug("Closet component rendered", { 
    hasImageUrls: !!getImageUrls, 
    hasCountItems: !!countItems 
  });

  // Memoize categories to prevent unnecessary recalculations
  const categories = useMemo((): CategoryPreview[] => {
    if (!getImageUrls || !countItems) return [];

    try {
      return Object.entries(CLOTHING_CATEGORIES)
        .map(([, displayName]) => ({
          name: displayName,
          count: countItems[displayName] || 0,
          images:
            getImageUrls.find((item) => item.category === displayName)?.images ||
            [],
        }))
        .filter((category) => category.count > 0);
    } catch (error) {
      Logger.error("Failed to process categories", error);
      return [];
    }
  }, [getImageUrls, countItems]);

  // Use the custom image rotation hook
  const { getCurrentImageUrl } = useImageRotation({
    categories,
    intervalMs: UI_CONSTANTS.IMAGE_ROTATION_INTERVAL,
  });

  // Memoized category card renderer
  const renderCategoryCard = useCallback(
    (category: CategoryPreview, index: number) => (
      <TouchableOpacity
        key={`${category.name}-${category.count}`} // Stable key based on content
        style={[
          styles.categoryCard,
          index % 2 === 0 ? styles.cardEven : styles.cardOdd,
        ]}
        onPress={() => {
          try {
            router.push({
              pathname: ROUTES.SCREENS.CLOSET.BROWSE_ITEMS,
              params: { categoryName: category.name },
            });
          } catch (error) {
            Logger.error("Navigation failed", error, { categoryName: category.name });
          }
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
          cachePolicy="memory-disk" // Enable aggressive caching
        />
        <View style={styles.cardContent}>
          <View style={styles.categoryText}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.count} items</Text>
          </View>
        </View>
        <View style={styles.cardAccent} />
      </TouchableOpacity>
    ),
    [getCurrentImageUrl]
  );

  return (
    <View style={[{ paddingTop: insets.top }, styles.container]}>
      <Header />
      {categories.length === 0 ? (
        <EmptyState
          title={TEXT_CONSTANTS.EMPTY_CLOSET.TITLE}
          subtitle={TEXT_CONSTANTS.EMPTY_CLOSET.SUBTITLE}
          actionText={TEXT_CONSTANTS.EMPTY_CLOSET.BUTTON_TEXT}
          onAction={() => {
            try {
              router.push(ROUTES.SCREENS.CLOSET.ADD_ITEM);
            } catch (error) {
              Logger.error("Navigation to add item failed", error);
            }
          }}
          icon={<Ionicons name="shirt-outline" size={48} color={COLORS.textSecondary} />}
        />
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Header Section */}
            <View style={styles.headerSection}></View>

            {/* Add Button */}
            {categories.length > 0 && (
              <Button
                title={TEXT_CONSTANTS.BUTTONS.ADD_ITEM}
                onPress={() => {
                  try {
                    router.push(ROUTES.SCREENS.CLOSET.ADD_ITEM);
                  } catch (error) {
                    Logger.error("Navigation to add item failed", error);
                  }
                }}
                variant="primary"
                size="lg"
                fullWidth
                icon={<Ionicons name="add" size={24} color={COLORS.pureWhite} />}
                style={styles.addButton}
              />
            )}
            {/* Browse All Section */}
            <Card variant="elevated" style={styles.browseAllCard}>
              <TouchableOpacity
                onPress={() => {
                  try {
                    router.push(ROUTES.SCREENS.CLOSET.BROWSE_ITEMS);
                  } catch (error) {
                    Logger.error("Navigation to browse items failed", error);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.browseAllContent}>
                  <View style={styles.browseAllLeft}>
                    <Text style={styles.browseAllTitle}>
                      {TEXT_CONSTANTS.SECTIONS.BROWSE_ALL}
                    </Text>
                    <Text style={styles.browseAllSubtitle}>
                      {TEXT_CONSTANTS.SECTIONS.BROWSE_ALL_SUBTITLE}
                    </Text>
                  </View>
                  <View style={styles.browseAllIcon}>
                    <Ionicons
                      name="grid-outline"
                      size={28}
                      color={COLORS.textPrimary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Card>

            {/* Categories Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{TEXT_CONSTANTS.SECTIONS.BROWSE_BY_CATEGORIES}</Text>
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
    marginBottom: SPACING.sm,
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
    marginBottom: SPACING.md,
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
    backgroundColor: COLORS.accent,
    opacity: 0.6,
  },

  // Floating Add Button
  createButton: {
    backgroundColor: COLORS.black,
    marginBottom: SPACING.md + 5,
    width: "100%",
    height: 45,
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
  createButtonText: {
    color: COLORS.pureWhite,
    fontSize: 20,
    fontWeight: "600",
  },
  addButton: {
    marginBottom: SPACING.md,
  },
});
