import { BORDER_RADIUS, COLORS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import BrowseItemsFromGenerateModal from "@/modals/browseItemsFromGenerate";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AskPrefrencedItem() {
  const { occasion, weather } = useLocalSearchParams();
  console.log("Selected Occasion in askPrefrencedItem :", occasion);
  console.log("Selected Weather in askPrefrencedItem :", weather);
  const [selected, setSelected] = React.useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);


  // Parse selectedIds from router params and cast to Id<"items">[]
  const rawSelected = useLocalSearchParams().selectedIds;
  const [selectedItemsIds, setSelectedItemsIds] = React.useState<Id<"items">[]>(
    () => {
      if (Array.isArray(rawSelected)) return rawSelected as Id<"items">[];
      if (typeof rawSelected === "string")
        return rawSelected.split(",") as Id<"items">[];
      return [];
    }
  );

  React.useEffect(() => {
    if (selectedItemsIds.length > 0) {
      setSelected(true);
    }
  }, [selectedItemsIds]);

  // Fetch all items, then filter client-side for selected IDs
  const items = useQuery(
    api.items.getItemsByIds,
    selectedItemsIds.length > 0
      ? { itemIds: selectedItemsIds as any[] }
      : "skip"
  );

  // Handle opening modal when "yes" is selected
  const handleYesSelection = () => {
    setSelected(true);
    setModalVisible(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleContinueButton = () => {
      router.push({
        pathname: "/screens/generateOutfit/aiGenerateOutfit",
        params: { 
          selectedIds: selectedItemsIds.join(","),
          occasion: occasion,
          weather: weather,
         },
      });
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={COLORS.offWhite} />
      </TouchableOpacity>
      <Text style={styles.title}>
        3. Is there any Item you prefer to wear today?
      </Text>
      <Text style={styles.subtitle}></Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[
            styles.card,
            selectedItemsIds.length > 0 && selected && styles.selectedCard,
          ]}
          activeOpacity={0.85}
          onPress={handleYesSelection}
        >
          <View style={styles.cardRow}>
            <Ionicons
              name="checkmark"
              size={24}
              color={
                selectedItemsIds.length > 0 && selected
                  ? COLORS.pureWhite
                  : COLORS.textPrimary
              }
              style={styles.cardIcon}
            />
            <Text
              style={[
                styles.cardText,
                selectedItemsIds.length > 0 &&
                  selected &&
                  styles.selectedCardText,
              ]}
            >
              Yes
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selected === false && styles.selectedCard]}
          activeOpacity={0.85}
          onPress={() => {
            setSelected(false);
            setSelectedItemsIds([]);
          }}
        >
          <View style={styles.cardRow}>
            <Ionicons
              name="close"
              size={24}
              color={selected === false ? COLORS.pureWhite : COLORS.textPrimary}
              style={styles.cardIcon}
            />
            <Text
              style={[
                styles.cardText,
                selected === false && styles.selectedCardText,
              ]}
            >
              No
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {selected && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={items ?? []}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <View style={styles.itemCardWrapper}>
              <View style={styles.itemCard}>
                {/* <ItemsPreviewCard
                imageUri={item.imageUrl}
                itemCaption={item.caption}
                category={item.category}
                subcategory={item.subcategory}
                onPress={() => {
                  console.log("Pressed card:", item, "at index:", index);
                }}
              /> */}
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.imagePreview}
                  contentFit="contain"
                />
              </View>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
          snapToAlignment="center"
          decelerationRate={0.95}
          snapToInterval={160 + SPACING.md}
        />
      )}

      <View style={styles.continueButtonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selected === null && styles.continueButtonDisabled,
          ]}
          onPress={
            handleContinueButton
          }
          disabled={selected === null}
        >
          <Text style={styles.continueButtonText}>Generate</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.pureWhite} />
        </TouchableOpacity>
      </View>

      <BrowseItemsFromGenerateModal
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flatListContent: {
    paddingBottom: SPACING.md,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
  },
  itemCardWrapper: {
    width: 200,
    height: 200,
    marginRight: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  itemCard: {
    width: 200,
    height: 200,
    borderRadius: 18,
    backgroundColor: COLORS.pureWhite,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemCaption: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.pureWhite,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: "hidden",
    marginBottom: 12,
    textAlign: "center",
    alignSelf: "center",
  },
  imagePreview: {
    width: "100%",
    height: "100%", // Adjusted to fill the card
    borderRadius: 18,
    backgroundColor: COLORS.border,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    width: 40,
    backgroundColor: COLORS.darkGray,
    borderRadius: 32,
    padding: 8,
  },
  title: {
    marginTop: SPACING.sm,
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  cardContainer: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "100%",
    marginBottom: SPACING.lg,
  },
  selectedCard: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  selectedCardText: {
    color: COLORS.pureWhite,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: {
    marginRight: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 4,
    textAlign: "center",
  },
  continueButtonContainer: {
    position: "absolute",
    bottom: SPACING.lg,
    marginTop: SPACING.xl,
    alignSelf: "center",
    width: "100%",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  continueButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  continueButtonIcon: {
    color: COLORS.pureWhite,
  },
});
