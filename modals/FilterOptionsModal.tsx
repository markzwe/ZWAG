import { COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FilterOption = {
  id: string;
  label: string;
  Options?: string[];
  subOptions?: string[];
};

type FilterOptionsModalProps = {
  visible: boolean;
  setFilter: (filters: string[]) => void;
  onClose: () => void;
  currentFilters?: string[];
  currentSubFilters?: string[];
};

//The brands should be dynamic, fetched from a server or database
//For now, we will use static values
const FILTER_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  {
    id: "tops",
    label: "Tops",
    subOptions: ["T-Shirts", "Shirts", "Tank Tops", "Sweaters", "Hoodies"],
  },
  {
    id: "bottoms",
    label: "Bottoms",
    subOptions: ["Jeans", "Pants", "Shorts", "Joggers"],
  },
  {
    id: "outerwear",
    label: "Outerwear",
    subOptions: [
      "Jackets",
      "Coats",
      "Blazers",
      "Cardigans",
      "Vests",
      "Raincoats",
    ],
  },
  {
    id: "shoes",
    label: "Shoes",
    subOptions: ["Sneakers", "Boots", "Sandals", "Flats", "Athletic"],
  },
  {
    id: "fullbody",
    label: "Full Body",
    subOptions: ["Jumpsuits", "Rompers", "Overalls", "Sets"],
  },
  {
    id: "color",
    label: "Color",
    subOptions: [
      "Black",
      "White",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Pink",
      "Purple",
      "Gray",
      "Brown",
    ],
  },
  {
    id: "style",
    label: "Style",
    subOptions: [
      "Casual",
      "Formal",
      "Business",
      "Sporty",
      "Vintage",
      "Bohemian",
      "Minimalist",
      "Streetwear",
    ],
  },
  {
    id: "brand",
    label: "Brand",
    subOptions: [
      "Nike",
      "Adidas",
      "Zara",
      "H&M",
      "Uniqlo",
      "Gap",
      "Levi's",
      "Other",
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    subOptions: [
      "Bags",
      "Jewelry",
      "Watches",
      "Belts",
      "Hats",
      "Scarves",
      "Sunglasses",
    ],
  },
];

export default function FilterOptionsModal({
  visible,
  setFilter,
  onClose,
  currentFilters = [],
  currentSubFilters = [],
}: FilterOptionsModalProps) {
  // expandedOptions keeps track of which filter categories are expanded to show their sub-options
  // It's a Set of option IDs (e.g. "tops", "bottoms")
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());

  // Initialize selected filters with current filters
  // This allows the modal to reflect any filters that were previously set
  // and allows the user to modify them
  const [selectedFilters, setSelectedFilters] =
    useState<string[]>(currentFilters);
  const [selectedSubFilters, setSelectedSubFilters] =
    useState<string[]>(currentSubFilters);

  // This function toggles whether a filter category is expanded or collapsed
  // If the category is already expanded, it collapses it; otherwise, it expands it
  const toggleExpanded = (optionId: string) => {
    // Create a copy of the current expanded options
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(optionId)) {
      // If already expanded, remove from set (collapse)
      newExpanded.delete(optionId);
    } else {
      // If not expanded, add to set (expand)
      newExpanded.add(optionId);
    }
    // Update state with new expanded options
    setExpandedOptions(newExpanded);
  };

  // This function adds or removes a filter from the selectedFilters array
  // If "All" is selected, it clears all filters
  // Otherwise, it toggles the filter: adds if not selected, removes if already selected
  const handleFilterSelect = (filter: string) => {
    if (filter === "All") {
      setSelectedFilters([]);
      return;
    }

    // Copy current selected filters
    const newFilters = [...selectedFilters];
    const filterIndex = newFilters.indexOf(filter);

    if (filterIndex > -1) {
      // If filter is already selected, remove it
      newFilters.splice(filterIndex, 1);
    } else {
      // If filter is not selected, add it
      newFilters.push(filter);
    }

    setSelectedFilters(newFilters);
  };

  // This function applies the selected filters
  // It calls the setFilter prop with the selected filters and closes the modal
  const applyFilter = () => {
    setFilter(selectedFilters);
    onClose();
  };

  // This function clears all selected filters
  const clearFilter = () => {
    setSelectedFilters([]);
  };

  // This function checks if a filter is selected
  // "All" is selected if no filters are selected
  // Otherwise, checks if the filter is in selectedFilters
  const isSelected = (filter: string) => {
    if (filter === "All") {
      return selectedFilters.length === 0;
    }
    return selectedFilters.includes(filter);
  };

  // This function checks if any sub-option of a category is selected
  // Returns true if at least one sub-option is selected
  const hasSelectedSubOptions = (option: FilterOption) => {
    if (!option.subOptions) return false;
    return option.subOptions.some((subOption) =>
      selectedFilters.includes(subOption)
    );
  };

  return (
    <Modal
      transparent={false}
      visible={visible}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <BlurView intensity={50} style={StyleSheet.absoluteFill}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Filter</Text>
            <TouchableOpacity onPress={clearFilter} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Options */}
          <ScrollView
            style={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {FILTER_OPTIONS.map((option) => (
              <View key={option.id} style={styles.optionGroup}>
                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.mainOptionButton,
                      (isSelected(option.label) ||
                        hasSelectedSubOptions(option)) &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => handleFilterSelect(option.label)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        (isSelected(option.label) ||
                          hasSelectedSubOptions(option)) &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <View style={styles.selectionIndicators}>
                      {hasSelectedSubOptions(option) &&
                        !isSelected(option.label) && (
                          <View style={styles.partialSelectionDot} />
                        )}
                      {isSelected(option.label) && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={COLORS.blue}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {option.subOptions && (
                    <TouchableOpacity
                      style={styles.expandButton}
                      onPress={() => toggleExpanded(option.id)}
                    >
                      <Ionicons
                        name={
                          expandedOptions.has(option.id)
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Sub-options */}
                {option.subOptions && expandedOptions.has(option.id) && (
                  <View style={styles.subOptionsContainer}>
                    {option.subOptions.map((subOption) => (
                      <TouchableOpacity
                        key={subOption}
                        style={[
                          styles.subOptionButton,
                          isSelected(subOption) &&
                            styles.subOptionButtonSelected,
                        ]}
                        onPress={() => handleFilterSelect(subOption)}
                      >
                        <Text
                          style={[
                            styles.subOptionText,
                            isSelected(subOption) &&
                              styles.subOptionTextSelected,
                          ]}
                        >
                          {subOption}
                        </Text>
                        {isSelected(subOption) && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={COLORS.blue}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {selectedFilters.length > 0 && (
              <View style={styles.selectedFiltersContainer}>
                <Text style={styles.selectedFiltersTitle}>
                  Selected filters:
                </Text>
                <View style={styles.selectedFiltersList}>
                  {selectedFilters.map((filter, index) => (
                    <View key={filter} style={styles.selectedFilterChip}>
                      <Text style={styles.selectedFilterChipText}>
                        {filter}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleFilterSelect(filter)}
                        style={styles.removeFilterButton}
                      >
                        <Ionicons name="close" size={14} color={COLORS.blue} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilter}
              >
                <Text style={styles.applyButtonText}>
                  Apply{" "}
                  {selectedFilters.length > 0
                    ? `(${selectedFilters.length})`
                    : "All"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  closeIconButton: {},
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  clearButton: {},
  clearButtonText: {
    fontSize: 16,
    color: COLORS.blue,
    fontWeight: "600",
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  optionGroup: {
    marginVertical: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainOptionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.offWhite,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  expandButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: COLORS.warmGrayAccent,
    borderRadius: 8,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.blue + "20",
    borderColor: COLORS.blue,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: COLORS.blue,
    fontWeight: "600",
  },
  selectionIndicators: {
    flexDirection: "row",
    alignItems: "center",
  },
  partialSelectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginRight: 8,
  },
  selectedFiltersContainer: {
    marginBottom: SPACING.sm,
  },
  selectedFiltersTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  selectedFiltersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue + "20",
    borderColor: COLORS.blue,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedFilterChipText: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: "500",
    marginRight: 4,
  },
  removeFilterButton: {
    padding: 2,
  },
  subOptionsContainer: {
    marginTop: 8,
    marginLeft: SPACING.lg,
    backgroundColor: COLORS.warmGrayAccent,
    borderRadius: 8,
    padding: 8,
  },
  subOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginVertical: 2,
  },
  subOptionButtonSelected: {
    backgroundColor: COLORS.blue + "20",
  },
  subOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  subOptionTextSelected: {
    color: COLORS.blue,
    fontWeight: "600",
  },
  actionButtons: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.divider,
  },
  selectedFilterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.md,
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.warmGrayAccent,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "600",
  },
});
