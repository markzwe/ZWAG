import { COLORS, SPACING } from "@/constants/theme";
import FilterOptionsModal from "@/modals/FilterOptionsModal";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BrowseItemsCategoryProps = {
  catagoryName: string;
};

export default function BrowseItems({
  catagoryName,
}: BrowseItemsCategoryProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handleOpenFilter = () => {
    setFilterVisible(true);
  };
  const handleSetFilter = (filter: string) => {
    setSelectedFilter(filter);
    setFilterVisible(false);
    // You can add logic here to filter the item list based on the selected filter
    console.log("Filter selected:", filter);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Add your search logic here
    console.log("Searching for:", text);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Section
        User can search for items, filter by categories, and subcategories */}
      <View style={styles.headerContainer}>
        {/* Search Bar and Filter side by side */}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.searchContainer, { flex: 1 }]}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textSecondary || "#666"}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search by description`}
              placeholderTextColor={COLORS.textSecondary || "#666"}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              clearButtonMode="while-editing" // iOS only
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.textSecondary || "#666"}
                />
              </TouchableOpacity>
            )}
          </View>
          {/* Divider */}
          <View style={styles.headerDivider} />
          <TouchableOpacity
            style={styles.filterContainer}
            onPress={handleOpenFilter}
          >
            <Text style={styles.filterText}>Filter</Text>
            <Ionicons name="filter" size={24} color={COLORS.pureWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items Components Preview */}
      <FlatList data={undefined} renderItem={undefined} />

      {/* Filter Options Modal */}
      <FilterOptionsModal
        visible={filterVisible}
        setFilter={handleSetFilter}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: SPACING.md,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: SPACING.sm,
    gap: SPACING.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border || "#e0e0e0",
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary || "#000",
    paddingVertical: 0, // Remove default padding to center text properly
  },
  clearButton: {
    marginLeft: SPACING.sm,
    padding: 2,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.buttonBackground,
    borderRadius: 32,
    marginBottom: SPACING.md,
    alignSelf: "flex-start",
  },
  filterText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.pureWhite,
    marginRight: SPACING.sm,
  },
  headerDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
    borderRadius: 1,
  },
});
