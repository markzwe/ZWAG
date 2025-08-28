// import { COLORS, SPACING } from "@/constants/theme";
// import { useUser } from "@clerk/clerk-expo";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import {
//   Alert,
//   Dimensions,
//   Image,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const { width } = Dimensions.get("window");

// const SUBSCRIPTION_PLANS = [
//   {
//     id: "monthly",
//     title: "Monthly",
//     price: "$9.99",
//     period: "/month",
//     description: "Perfect for trying out ZWAG",
//     popular: false,
//   },
//   {
//     id: "yearly",
//     title: "Yearly",
//     price: "$29.99",
//     period: "/year",
//     description: "Save 50% with annual billing",
//     popular: true,
//     savings: "Save $60",
//   },
// ];

// const PREMIUM_FEATURES = [
//   {
//     icon: "sparkles",
//     title: "Unlimited AI Outfits",
//     description: "Generate endless outfit combinations",
//   },
//   {
//     icon: "camera",
//     title: "Advanced Photo Processing",
//     description: "Professional background removal & enhancement",
//   },
//   {
//     icon: "trending-up",
//     title: "Style Analytics",
//     description: "Track your style evolution and preferences",
//   },
//   {
//     icon: "people",
//     title: "Social Features",
//     description: "Share outfits and get feedback from community",
//   },
//   {
//     icon: "calendar",
//     title: "Seasonal Collections",
//     description: "Access exclusive seasonal outfit recommendations",
//   },
//   {
//     icon: "star",
//     title: "Priority Support",
//     description: "Get help when you need it most",
//   },
// ];

// export default function PayWall() {
//   const router = useRouter();
//   const { user } = useUser();
//   const [selectedPlan, setSelectedPlan] = useState("yearly");
//   const [isLoading, setIsLoading] = useState(false);

//   // Mark onboarding as complete and navigate to main app
//   const completeOnboarding = async () => {
//     try {
//       await user?.update({
//         unsafeMetadata: {
//           ...user.unsafeMetadata,
//           hasCompletedOnboarding: true,
//         },
//       });
//       router.replace("/(tabs)");
//     } catch (error) {
//       console.error("Failed to complete onboarding:", error);
//       // Still navigate even if metadata update fails
//       router.replace("/(tabs)");
//     }
//   };

//   const handleSubscribe = async () => {
//     setIsLoading(true);
//     try {
//       // TODO: Implement actual subscription logic
//       Alert.alert(
//         "Subscription",
//         `You selected the ${selectedPlan} plan. Payment integration coming soon!`,
//         [
//           {
//             text: "Continue",
//             onPress: completeOnboarding,
//           },
//         ]
//       );
//     } catch (error) {
//       Alert.alert("Error", "Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSkip = () => {
//     Alert.alert(
//       "Continue with Free Version?",
//       "You'll have limited AI generations and features. You can upgrade anytime in settings.",
//       [
//         {
//           text: "Go Premium",
//           style: "default",
//         },
//         {
//           text: "Continue Free",
//           style: "destructive",
//           onPress: completeOnboarding,
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
//             <Text style={styles.skipText}>Skip</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Logo and Title */}
//         <View style={styles.titleSection}>
//           <Image
//             source={require("@/assets/images/ZWAG-logo.png")}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//           <Text style={styles.title}>Unlock Your Style Potential</Text>
//           <Text style={styles.subtitle}>
//             Get unlimited access to AI-powered outfit generation
//           </Text>
//         </View>

//         {/* Features List - Compact */}
//         <View style={styles.featuresSection}>
//           {PREMIUM_FEATURES.slice(0, 4).map((feature, index) => (
//             <View key={index} style={styles.featureItem}>
//               <View style={styles.featureIcon}>
//                 <Ionicons
//                   name={feature.icon as any}
//                   size={16}
//                   color={COLORS.pureWhite}
//                 />
//               </View>
//               <Text style={styles.featureText}>{feature.title}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Subscription Plans */}
//         <View style={styles.plansSection}>
//           <Text style={styles.plansTitle}>Choose Your Plan</Text>
//           {SUBSCRIPTION_PLANS.map((plan) => (
//             <TouchableOpacity
//               key={plan.id}
//               style={[
//                 styles.planCard,
//                 selectedPlan === plan.id && styles.selectedPlan,
//                 plan.popular && styles.popularPlan,
//               ]}
//               onPress={() => setSelectedPlan(plan.id)}
//             >
//               {plan.popular && (
//                 <View style={styles.popularBadge}>
//                   <Text style={styles.popularText}>Most Popular</Text>
//                 </View>
//               )}

//               <View style={styles.planContent}>
//                 <View style={styles.planInfo}>
//                   <Text style={styles.planTitle}>{plan.title}</Text>
//                   <Text style={styles.planDescription}>{plan.description}</Text>
//                 </View>
//                 <View style={styles.planPricing}>
//                   <Text style={styles.planPrice}>{plan.price}</Text>
//                   <Text style={styles.planPeriod}>{plan.period}</Text>
//                   {plan.savings && (
//                     <Text style={styles.savingsText}>{plan.savings}</Text>
//                   )}
//                 </View>
//                 <View style={styles.radioContainer}>
//                   <View
//                     style={[
//                       styles.radio,
//                       selectedPlan === plan.id && styles.radioSelected,
//                     ]}
//                   >
//                     {selectedPlan === plan.id && (
//                       <View style={styles.radioInner} />
//                     )}
//                   </View>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Compact Bottom CTA */}
//       <View style={styles.bottomSection}>
//         <TouchableOpacity
//           style={[styles.subscribeButton, isLoading && styles.disabledButton]}
//           onPress={handleSubscribe}
//           disabled={isLoading}
//         >
//           <Text style={styles.subscribeButtonText}>
//             {isLoading ? "Processing..." : "Start Free Trial"}
//           </Text>
//         </TouchableOpacity>

//         <Text style={styles.termsText}>
//           ✓ Cancel anytime • ✓ 7-day free trial
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.pureWhite,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: SPACING.md,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     paddingVertical: SPACING.xs,
//   },
//   skipButton: {
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: SPACING.xs,
//   },
//   skipText: {
//     fontSize: 16,
//     color: COLORS.textSecondary,
//     fontWeight: "500",
//   },
//   titleSection: {
//     alignItems: "center",
//     paddingVertical: SPACING.md,
//   },
//   logo: {
//     width: 60,
//     height: 60,
//     marginBottom: SPACING.sm,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: COLORS.textPrimary,
//     textAlign: "center",
//     marginBottom: SPACING.xs,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     textAlign: "center",
//     lineHeight: 18,
//   },
//   featuresSection: {
//     paddingVertical: SPACING.md,
//   },
//   featureItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: SPACING.sm,
//   },
//   featureIcon: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: COLORS.textPrimary,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: SPACING.sm,
//   },
//   featureText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//   },
//   plansSection: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   plansTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: COLORS.textPrimary,
//     textAlign: "center",
//     marginBottom: SPACING.md,
//   },
//   planCard: {
//     borderWidth: 2,
//     borderColor: COLORS.border,
//     borderRadius: 12,
//     padding: SPACING.sm,
//     marginBottom: SPACING.sm,
//     position: "relative",
//   },
//   selectedPlan: {
//     borderColor: COLORS.textPrimary,
//     backgroundColor: "#f8f9fa",
//   },
//   popularPlan: {
//     borderColor: COLORS.textPrimary,
//     backgroundColor: "#f8f9fa",
//   },
//   popularBadge: {
//     position: "absolute",
//     top: -8,
//     left: SPACING.sm,
//     backgroundColor: COLORS.textPrimary,
//     paddingHorizontal: SPACING.xs,
//     paddingVertical: 2,
//     borderRadius: 8,
//   },
//   popularText: {
//     fontSize: 10,
//     fontWeight: "600",
//     color: COLORS.pureWhite,
//   },
//   planContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   planInfo: {
//     flex: 1,
//   },
//   planTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: COLORS.textPrimary,
//     marginBottom: 2,
//   },
//   planDescription: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },
//   planPricing: {
//     alignItems: "center",
//     marginHorizontal: SPACING.sm,
//   },
//   planPrice: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: COLORS.textPrimary,
//   },
//   planPeriod: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     marginTop: -2,
//   },
//   savingsText: {
//     fontSize: 10,
//     fontWeight: "600",
//     color: "#22c55e",
//     marginTop: 2,
//   },
//   radioContainer: {
//     justifyContent: "center",
//   },
//   radio: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     borderWidth: 2,
//     borderColor: COLORS.border,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   radioSelected: {
//     borderColor: COLORS.textPrimary,
//   },
//   radioInner: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.textPrimary,
//   },
//   bottomSection: {
//     paddingHorizontal: SPACING.md,
//     paddingBottom: SPACING.sm,
//     paddingTop: SPACING.xs,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     backgroundColor: COLORS.pureWhite,
//   },
//   subscribeButton: {
//     backgroundColor: COLORS.textPrimary,
//     padding: SPACING.sm,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: SPACING.xs,
//   },
//   disabledButton: {
//     backgroundColor: COLORS.border,
//   },
//   subscribeButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.pureWhite,
//   },
//   termsText: {
//     fontSize: 10,
//     color: COLORS.textSecondary,
//     textAlign: "center",
//     lineHeight: 14,
//   },
// });
