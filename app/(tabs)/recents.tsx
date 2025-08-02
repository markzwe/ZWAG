import CacheStatsIndicator from "@/components/CacheStatsIndicator";
import GeneratedOutfitsCanvas from "@/components/GeneratedOutfitsCanvas";
import Header from "@/components/Header";
import OutfitPreviewCard from "@/components/OutfitPreviewCard";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useCachedOutfits } from "@/hooks/useCachedOutfits";
import { useCacheManager } from "@/utils/cacheManager";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Recents() {
  const insets = useSafeAreaInsets();

  // Use the custom caching hook instead of direct useQuery
  const { outfits: cachedOutfits, isLoading, cacheStats } = useCachedOutfits();
  const { invalidateOutfits } = useCacheManager();
  const deleteOutfit = useMutation(api.outfits.deleteOutfit);

  const [selectedOutfit, setSelectedOutfit] = useState<any>(null);
  const [showOutfitModal, setShowOutfitModal] = useState(false);

  // Memoize handlers to prevent unnecessary re-renders of child components
  const handleOutfitPress = useCallback((outfit: any) => {
    setSelectedOutfit(outfit);
    setShowOutfitModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowOutfitModal(false);
    setSelectedOutfit(null);
  }, []);

  const handleDeleteOutfit = useCallback(() => {
    if (!selectedOutfit) return;

    Alert.alert(
      "Delete Outfit",
      "Are you sure you want to delete this outfit?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteOutfit({ outfitId: selectedOutfit._id });
              // Invalidate cache after successful deletion
              invalidateOutfits();
              handleCloseModal();
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete outfit. Please try again."
              );
            }
          },
        },
      ]
    );
  }, [selectedOutfit, deleteOutfit, handleCloseModal]);

  // Memoize the FlatList renderItem to prevent unnecessary re-renders
  const renderOutfitItem = useCallback(
    ({ item }: { item: any }) => (
      <OutfitPreviewCard
        key={item.cacheKey} // Use stable cache key
        top={item.top}
        bottom={item.bottom}
        shoes={item.shoes}
        outerwear={item.outerwear}
        accessories={item.accessories}
        fullBody={item.fullBody}
        onPress={() => handleOutfitPress(item)}
      />
    ),
    [handleOutfitPress]
  );

  // Memoize the key extractor
  const keyExtractor = useCallback(
    (item: any) => item.cacheKey || item._id,
    []
  );

  // Show loading indicator if data is still loading
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { paddingTop: insets.top },
        ]}
      >
        <Header />
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
        <Text style={styles.loadingText}>Loading your outfits...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header />

        {/* Cache Stats Indicator (Development only) */}
        <CacheStatsIndicator cacheStats={cacheStats} visible={__DEV__} />

        {/* Outfit Preview Card */}
        <FlatList
          showsVerticalScrollIndicator={false}
          data={cachedOutfits}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.row}
          renderItem={renderOutfitItem}
          // Performance optimizations for better caching
          removeClippedSubviews={true}
          maxToRenderPerBatch={4} // Render 2 rows at a time
          updateCellsBatchingPeriod={50}
          initialNumToRender={6} // Show 3 rows initially
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate height of each outfit card
            offset: 200 * Math.floor(index / 2), // Row height * row index
            index,
          })}
        />

        {/* Outfit Detail Modal */}
        <Modal
          visible={showOutfitModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowOutfitModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <View style={styles.closeButtonContent}>
                  <View style={styles.closeBar} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {selectedOutfit && (
                <GeneratedOutfitsCanvas
                  item={{
                    top: selectedOutfit.top,
                    bottom: selectedOutfit.bottom,
                    shoes: selectedOutfit.shoes,
                    outerwear: selectedOutfit.outerwear,
                    accessories: selectedOutfit.accessories,
                    fullBody: selectedOutfit.accessories
                      ? selectedOutfit.accessories[0]
                      : undefined,
                  }}
                />
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteOutfit}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={COLORS.pureWhite}
                />
                <Text style={styles.deleteButtonText}>Delete Outfit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  flatListContent: {
    padding: 8,
  },
  row: {
    justifyContent: "space-around",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalContent: {
    flex: 1,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  closeButtonContent: {
    alignItems: "center",
  },
  closeBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 2,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.red,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});
