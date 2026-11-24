import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  SHADOWS,
  SPACING,
} from "@/constants/theme";
import PrivacyModal from "@/modals/PrivacyModal";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View
        style={[styles.iconContainer, danger && styles.dangerIconContainer]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={danger ? COLORS.error : COLORS.textPrimary}
        />
      </View>
      <View style={styles.menuItemText}>
        <Text style={[styles.menuItemTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {showArrow && (
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    )}
  </TouchableOpacity>
);

export default function Menu() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const supportUrl = process.env.EXPO_PUBLIC_SUPPORT_URL;

  // Animation setup
  const { width } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(width)).current; // Start from right (off-screen)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false);

  useEffect(() => {
    // Slide in from right to left animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, // End position (on-screen)
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () =>
          signOut()
            .then(() => router.push("/"))
            .catch((error) => {
              console.error("Sign out error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }),
      },
    ]);
  };
  const { confirmDeletion: handleDeleteAccount } = useDeleteAccount();

  const menuSections = [
    {
      title: "Prefrences",
      items: [
        {
          icon: "color-palette-outline" as const,
          title: "Outfit Preferences",
          subtitle: "Customize occasions and clothing preferences",
          onPress: () => router.push("/screens/menuScreens/stylePreferences"),
        },
      ],
    },
    {
      title: "App Settings",
      items: [
        // {
        //   icon: "notifications-outline" as const,
        //   title: "Notifications",
        //   subtitle: "Outfit suggestions and updates",
        //   onPress: () => console.log("Notifications pressed"),
        // },
        {
          icon: "lock-closed-outline" as const,
          title: "Privacy & Security",
          subtitle: "Manage your data and security settings",
          onPress: () => setPrivacyModalVisible(true),
        },
        ...(supportUrl?.startsWith("https://") ? [{
          icon: "help-circle-outline" as const,
          title: "Help & Support",
          subtitle: "Get help with your closet or account",
          onPress: () => void Linking.openURL(supportUrl).catch(() =>
            Alert.alert("Could not open support")),
        }] : []),
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileEmail}>
              {user?.primaryEmailAddress?.emailAddress || "Not signed in"}
            </Text>
          </View> 
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <MenuItem
                  key={itemIndex}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={item.onPress}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <MenuItem
            icon="log-out-outline"
            title="Sign Out"
            onPress={handleSignOut}
            showArrow={false}
            danger={true}
          />
        </View>
        <View style={styles.DeleteSection}>
          <MenuItem
            icon="trash-outline"
            title="Delete Account"
            onPress={handleDeleteAccount}
            showArrow={false}
            danger={true}
          />
        </View>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.primaryBackground,
            borderTopColor: COLORS.divider,
            gap: SPACING.sm - 3,
          }}
        >
          <Image
            source={require("@/assets/images/ZWAG.png")}
            style={{ width: 40, height: 40, borderRadius: 8, opacity: 0.9 }}
            contentFit="contain"
          />
          <Text style={{ color: COLORS.darkGray }}> Version: 1.0.0</Text>
          <View style={{ flexDirection: "row", gap: SPACING.md }}>
            <Ionicons
              name="logo-instagram"
              size={24}
              color={COLORS.textPrimary}
              onPress={async () =>
                await Linking.openURL("https://www.instagram.com/zwag.app/")
              }
            />
            <Ionicons
              name="logo-tiktok"
              size={24}
              color={COLORS.textPrimary}
              onPress={async () =>
                await Linking.openURL("https://www.tiktok.com/@zwag.app")
              }
            />
            <Ionicons
              name="earth"
              size={24}
              color={COLORS.textPrimary}
              onPress={async () =>
                await Linking.openURL("https://www.zwag.app")
              }
            />
          </View>
        </View>
        <PrivacyModal
          visible={privacyModalVisible}
          showControls
          onClose={() => {
            setPrivacyModalVisible(false);}}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },

  header: {
    flexDirection: "row",
    paddingHorizontal: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    backgroundColor: COLORS.pureWhite,
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  editProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  menuSection: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  dangerIconContainer: {
    backgroundColor: `${COLORS.error}10`,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  dangerText: {
    color: COLORS.error,
  },
  menuItemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  signOutSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  DeleteSection: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
});
