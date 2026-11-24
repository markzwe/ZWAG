import ItemsPreview from "@/components/ItemPreviewCard";
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
  setSelectedFilter,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <BlurView
      intensity={10}
      tint="light"
      style={[styles.headerOuter, { paddingTop: insets.top }]}
    >
      {/* Header Container */}
      <View style={styles.headerContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={COLORS.pureWhite}
          />
        </TouchableOpacity>

        {/* Title or Search Bar */}
        <View style={styles.centerContainer}>
          {!showSearchBar ? (
            <Text style={styles.headerTitle} numberOfLines={1}></Text>
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

export default function BrowseItems() {
  // get the selected category from the router params
  const { categoryName } = useLocalSearchParams() as { categoryName: string };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  // selectedFilters is now an array to support multi-select
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    categoryName ? [categoryName] : []
  );
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Setup dynamic query args
  const itemQueryArgs: Record<string, any> = {};
  if (searchQuery) itemQueryArgs.caption = searchQuery;
  if (selectedFilters.length > 0)
    itemQueryArgs.category =
      selectedFilters.length === 1 ? selectedFilters[0] : selectedFilters;

  // Fetch items from Convex using filters
  const items = useQuery(api.items.getItem, itemQueryArgs);

  // Remove dummyItems, use items from query

  const handleOpenFilter = () => {
    setFilterVisible(true);
  };

  // Accept array of filters from modal
  const handleSetFilter = (filters: string[]) => {
    setSelectedFilters(filters);
    setFilterVisible(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleCardPress = (item: any) => {
    // Do something, e.g. navigate or show details
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

  return (
    <View style={styles.container}>
      {/* Content */}
      <FlatList
        stickyHeaderHiddenOnScroll={false}
        ListHeaderComponent={
          <BrowseHeader
            catagoryName={categoryName}
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
          />
        }
        stickyHeaderIndices={[0]}
        data={items || []}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
        bounces={false}
        renderItem={({ item }) =>
          (
            <ItemsPreview
              imageUri={item.imageUrl}
              itemCaption={item.caption}
              category={item.category}
              subcategory={item.subcategory}
              onPress={() => {
                handleCardPress(item);
              }}
            />
          )
        }
      />
      {/* Filter Options Modal */}
      <FilterOptionsModal
        visible={filterVisible}
        setFilter={handleSetFilter}
        onClose={() => setFilterVisible(false)}
        currentFilters={selectedFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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