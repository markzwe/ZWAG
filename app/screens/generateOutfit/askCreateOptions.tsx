// import { BORDER_RADIUS, COLORS, SPACING } from "@/constants/theme";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { Sliders } from "lucide-react-native";
// import React from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function AskCreateOptions() {
//   const [selected, setSelected] = React.useState<"ai" | "manual" | null>(null);
//   return (
//     <SafeAreaView style={styles.container}>
//       <TouchableOpacity
//         onPress={() => router.push("/(tabs)")}
//         style={styles.backButton}
//       >
//         <Ionicons name="chevron-back" size={24} color={COLORS.offWhite} />
//       </TouchableOpacity>
//       <Text style={styles.title}>Create Your Outfit</Text>
//       <Text style={styles.subtitle}>Choose how you want to start</Text>

//       <View style={styles.cardContainer}>
//         <TouchableOpacity
//           style={[styles.card, selected === "ai" && styles.selectedCard]}
//           activeOpacity={0.85}
//           onPress={() => setSelected("ai")}
//         >
//           <Ionicons
//             name="sparkles"
//             size={24}
//             color={selected === "ai" ? COLORS.pureWhite : COLORS.textPrimary}
//             style={styles.cardIcon}
//           />
//           <Text
//             style={[
//               styles.cardText,
//               selected === "ai" && styles.selectedCardText,
//             ]}
//           >
//             Generate with Ai
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.card, selected === "manual" && styles.selectedCard]}
//           activeOpacity={0.85}
//           onPress={() => setSelected("manual")}
//         >
//           <Ionicons
//             name="create"
//             size={24}
//             color={
//               selected === "manual" ? COLORS.pureWhite : COLORS.textPrimary
//             }
//             style={styles.cardIcon}
//           />
//           <Text
//             style={[
//               styles.cardText,
//               selected === "manual" && styles.selectedCardText,
//             ]}
//           >
//             I'll create it Manually
//           </Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.continueButtonContainer}>
//         <TouchableOpacity
//           style={[
//             styles.continueButton,
//             !selected && styles.continueButtonDisabled,
//           ]}
//           onPress={() =>
//             selected && router.push("/screens/generateOutfit/askOccasion")
//           }
//           disabled={!selected}
//         >
//           <Text style={styles.continueButtonText}>Continue</Text>
//           <Ionicons name="arrow-forward" size={20} color={COLORS.pureWhite} />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.primaryBackground,
//     paddingHorizontal: SPACING.md,
//   },
//   backButton: {
//     width: 40,
//     backgroundColor: COLORS.darkGray,
//     borderRadius: 32,
//     padding: 8,
//   },
//   title: {
//     marginTop: SPACING.sm,
//     fontSize: 28,
//     fontWeight: "700",
//     color: COLORS.textPrimary,
//     textAlign: "center",
//     marginBottom: SPACING.sm,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: COLORS.textSecondary,
//     textAlign: "center",
//     marginBottom: SPACING.xl,
//   },
//   cardContainer: {
//     width: "100%",
//     flexDirection: "column",
//     justifyContent: "space-between",
//     gap: SPACING.sm,
//   },
//   card: {
//     backgroundColor: COLORS.pureWhite,
//     borderRadius: 15,
//     borderWidth: 2,
//     borderColor: "transparent",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     width: "100%",
//     marginBottom: SPACING.lg,
//   },
//   selectedCard: {
//     backgroundColor: COLORS.textPrimary,
//     borderColor: COLORS.textPrimary,
//   },
//   selectedCardText: {
//     color: COLORS.pureWhite,
//   },
//   cardIcon: {
//     marginBottom: 8,
//   },
//   cardText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//     marginTop: 4,
//     textAlign: "center",
//   },
//   continueButtonContainer: {
//     position: "absolute",
//     bottom: SPACING.lg,
//     marginTop: SPACING.xl,
//     alignSelf: "center",
//     width: "100%",
//   },
//   continueButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: COLORS.textPrimary,
//     paddingVertical: SPACING.md,
//     paddingHorizontal: SPACING.lg,
//     borderRadius: BORDER_RADIUS.lg,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   continueButtonDisabled: {
//     backgroundColor: COLORS.lightGray,
//   },
//   continueButtonText: {
//     color: COLORS.pureWhite,
//     fontSize: 16,
//     fontWeight: "bold",
//     marginRight: 8,
//   },
//   continueButtonIcon: {
//     color: COLORS.pureWhite,
//   },
// });
