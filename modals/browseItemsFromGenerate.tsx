import ItemsPreview from "@/components/ItemPreviewCard";
import ItemsPreviewCardGenerate from "@/components/ItemPreviewCardGenerate";
import { BORDER_RADIUS, COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import FilterOptionsModal from "@/modals/FilterOptionsModal";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BrowseHeaderProps = {
  catagoryName: string;
  showSearchBar: boolean;
  searchQuery: string;
  selectedFilter: string;
  handleSearch: (text: string) => void;
  clearSearch: () => void;
  toggleSearchBar: () => void;
  handleOpenFilter: () => void;
  setSelectedFilter: (filter: string | null) => void;
  onClose: () => void;
};

const BrowseHeader: React.FC<BrowseHeaderProps> = ({
  catagoryName,
  showSearchBar,
  searchQuery,
  selectedFilter,
  handleSearch,
  clearSearch,
  toggleSearchBar,
  handleOpenFilter,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <BlurView
      intensity={10}
      tint="light"
      style={[styles.headerOuter, { paddingTop: 20 }]}
    >
      {/* Header Container */}
      <View style={styles.headerContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onClose()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name='close'
            size={22}
            color={COLORS.pureWhite}
          />
        </TouchableOpacity>

        {/* Title or Search Bar */}
        <View style={styles.centerContainer}>
          {!showSearchBar ? (
            <View/>
          ) : (
            <View style={styles.iosSearchBarContainer}>
              <Ionicons
                name="search"
                size={20}
                color={COLORS.textSecondary}
                style={styles.iosSearchIcon}
              />
              <TextInput
                style={styles.iosSearchInput}
                placeholder="Search"
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                autoFocus
                selectionColor={COLORS.blue}
                clearButtonMode="never"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                  style={styles.iosClearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {!showSearchBar && (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter && styles.filterChipActive,
              ]}
              onPress={handleOpenFilter}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="filter"
                size={16}
                color={selectedFilter ? COLORS.offWhite : COLORS.textSecondary}
                style={styles.filterIconStyle}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter && styles.filterTextActive,
                ]}
              >
                Filter
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleSearchBar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showSearchBar ? "close" : "search"}
              size={22}
              color={styles.headerIcon.color}
            />
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
};

type BrowseItemsFromGenerateModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function BrowseItemsFromGenerateModal({ 
  visible, 
  onClose 
}: BrowseItemsFromGenerateModalProps) {
  const insets = useSafeAreaInsets();
  // get the selected category from the router params
  const { categoryName } = useLocalSearchParams() as { categoryName: string };
  console.log("Selected category:", categoryName);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  // selectedFilters is now an array to support multi-select
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    categoryName ? [categoryName] : []
  );
  const [showSearchBar, setShowSearchBar] = useState(false);
  // Track selected item ids for generate mode (multi-select)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Setup dynamic query args
  const itemQueryArgs: Record<string, any> = {};
  if (searchQuery) itemQueryArgs.caption = searchQuery;
  if (selectedFilters.length > 0)
    itemQueryArgs.category =
      selectedFilters.length === 1 ? selectedFilters[0] : selectedFilters;

  // Fetch items from Convex using filters
  const items = useQuery(api.items.getItem, itemQueryArgs);

  const handleOpenFilter = () => {
    setFilterVisible(true);
  };

  // Handle passing selected items to the next screen if in generate mode
  const handlePassChosenItems = () => {
    router.push({
      pathname: "/screens/generateOutfit/askPrefrencedItem",
      params: {
        selectedIds: selectedIds,
      },
    });
    onClose(); // Close modal after navigation
  };

  // Accept array of filters from modal
  const handleSetFilter = (filters: string[]) => {
    setSelectedFilters(filters);
    setFilterVisible(false);
    console.log("Filters selected:", filters);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    console.log("Searching for:", text);
  };

  const handleCardPress = (item: any, index: number) => {
    // Do something, e.g. navigate or show details
    console.log("Pressed card:", item, "at index:", index);
    router.push({
      pathname: "/screens/closet/itemViewDetail",
      params: {
        itemId: item._id,
      },
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const toggleSearchBar = () => {
    if (showSearchBar) {
      clearSearch();
    }
    setShowSearchBar(!showSearchBar);
  };

  const handleModalClose = () => {
    // Reset state when modal closes
    setSearchQuery("");
    setShowSearchBar(false);
    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal 
      visible={visible}
      presentationStyle='pageSheet'
      animationType='slide'
      onRequestClose={handleModalClose}
      style={styles.container}
    >
      {/* Content */}
      <FlatList
        stickyHeaderHiddenOnScroll={false}
        ListHeaderComponent={
          <BrowseHeader
            catagoryName={categoryName || "Items"}
            showSearchBar={showSearchBar}
            searchQuery={searchQuery}
            selectedFilter={selectedFilters.join(", ")}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            toggleSearchBar={toggleSearchBar}
            handleOpenFilter={handleOpenFilter}
            setSelectedFilter={(filter) =>
              setSelectedFilters(filter ? [filter] : [])
            }
            onClose={onClose}
          />
        }
        stickyHeaderIndices={[0]}
        data={items || []}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 120 }
        ]}
        bounces={false}
        renderItem={({ item, index }) =>
          (
            <ItemsPreviewCardGenerate
              imageUri={item.imageUrl}
              itemCaption={item.caption}
              category={item.category}
              subcategory={item.subcategory}
              onPress={() => {
                console.log("Pressed card:", item, "at index:", index);
                setSelectedIds((prev) =>
                  prev.includes(item._id)
                    ? prev.filter((id) => id !== item._id)
                    : [...prev, item._id]
                );
              }}
              selected={selectedIds.includes(item._id)}
            />
          ) 
        }
      />
      
      {/* Enhanced Sticky Footer */}
      <View
        style={[styles.stickyFooter, { paddingBottom: insets.bottom + 20 }]}
      >
        <TouchableOpacity
          style={[
            styles.footerButton,
            selectedIds.length === 0 && styles.footerButtonDisabled
          ]}
          activeOpacity={0.9}
          disabled={selectedIds.length === 0}
          onPress={handlePassChosenItems}
        >
          <BlurView
            intensity={40}
            tint="systemMaterialDark"
            style={styles.footerPill}
          >
            <View style={styles.footerContent}>
              <Text style={[
                styles.footerPillText,
                selectedIds.length === 0 && styles.footerTextDisabled
              ]}>
                {selectedIds.length === 0
                  ? "Select items to continue"
                  : `Continue with ${selectedIds.length}`}
              </Text>
              {selectedIds.length > 0 && (
                <View style={styles.continueIcon}>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={COLORS.pureWhite}
                  />
                </View>
              )}
            </View>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Filter Options Modal */}
      <FilterOptionsModal
        visible={filterVisible}
        setFilter={handleSetFilter}
        onClose={() => setFilterVisible(false)}
        currentFilters={selectedFilters}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Enhanced Footer Styles Only
  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  footerButton: {
    width: "100%",
    maxWidth: 280,
  },

  footerButtonDisabled: {
    opacity: 0.6,
  },

  footerPill: {
    overflow: "hidden",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  footerPillText: {
    fontSize: 16,
    color: COLORS.pureWhite,
    fontWeight: "600",
    letterSpacing: 0.1,
    flex: 1,
  },

  footerTextDisabled: {
    color: COLORS.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },

  continueIcon: {
    backgroundColor: COLORS.blue,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  // All your existing styles remain unchanged below
  headerOuter: {
    paddingHorizontal: 8,
    backgroundColor: "rgba(73, 73, 73, 0.23)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: SPACING.md,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    borderColor: COLORS.darkGray,
    paddingHorizontal: 18,
    marginBottom: 1,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
    borderRadius: 19,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: Platform.select({ ios: 19, android: 22 }),
    fontWeight: Platform.select({ ios: "700", android: "700" }),
    color: COLORS.pureWhite,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warmGrayAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: 8,
    minHeight: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  filterIconStyle: {
    marginRight: 6,
  },
  filterText: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontWeight: Platform.select({ ios: "500", android: "400" }),
    color: COLORS.textSecondary,
    maxWidth: 80,
  },
  filterTextActive: {
    color: COLORS.pureWhite,
    fontWeight: Platform.select({ ios: "600", android: "500" }),
  },
  clearFilterButton: {
    marginLeft: 6,
    padding: 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.pureWhite,
  },
  iosSearchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.offWhite,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 36,
    marginVertical: 2,
  },
  iosSearchIcon: {
    marginRight: 8,
    marginLeft: 2,
  },
  iosSearchInput: {
    flex: 1,
    fontSize: 17,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    paddingLeft: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  iosClearButton: {
    padding: 2,
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },

  // Color definitions for consistency
  headerIcon: {
    color: COLORS.pureWhite,
  },
  filterIcon: {
    color: COLORS.pureWhite,
  },
  filterIconActive: {
    color: COLORS.pureWhite,
  },
  clearFilterIcon: {
    color: COLORS.pureWhite,
  },
  searchIcon: {
    color: COLORS.pureWhite,
  },
  placeholderText: {
    color: COLORS.pureWhite,
  },
  selectionColor: {
    color: COLORS.blue,
  },
  clearIcon: {
    color: COLORS.pureWhite,
  },
});