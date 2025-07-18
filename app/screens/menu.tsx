import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import React, { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import {
  COLORS,
  SPACING,
  SHADOWS,
  FONT_SIZES,
  BORDER_RADIUS,
} from "@/constants/theme";
import { useAuth, useUser } from "@clerk/clerk-expo";

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

  // Animation setup
  const { width } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(width)).current; // Start from right (off-screen)
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
        onPress: () => signOut(),
      },
    ]);
  };

  const menuSections = [
    {
      title: "Prefrences",
      items: [
        {
          icon: "shirt-outline" as const,
          title: "My Items",
          subtitle: "View and manage your clothing",
          onPress: () => router.push("/(tabs)"),
        },
        {
          icon: "color-palette-outline" as const,
          title: "Style Preferences",
          subtitle: "Customize your fashion style",
          onPress: () => console.log("Style preferences pressed"),
        },
        {
          icon: "analytics-outline" as const,
          title: "Outfit History",
          subtitle: "View your generated outfits",
          onPress: () => console.log("Outfit history pressed"),
        },
      ],
    },
    {
      title: "App Settings",
      items: [
        {
          icon: "notifications-outline" as const,
          title: "Notifications",
          subtitle: "Outfit suggestions and updates",
          onPress: () => console.log("Notifications pressed"),
        },
        {
          icon: "settings-outline" as const,
          title: "Preferences",
          subtitle: "App settings and customization",
          onPress: () => console.log("Settings pressed"),
        },
        {
          icon: "help-circle-outline" as const,
          title: "Help & Support",
          subtitle: "Get help and contact support",
          onPress: () => console.log("Help pressed"),
        },
        {
          icon: "information-circle-outline" as const,
          title: "About",
          subtitle: "App version and information",
          onPress: () => console.log("About pressed"),
        },
      ],
    },
  ];

  return (
    <>
      <View style={styles.safeArea}>
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
              <Ionicons
                name="close"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileEmail}>
                {user?.primaryEmailAddress?.emailAddress || "Not signed in"}
              </Text>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <Ionicons name="pencil" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
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
        </Animated.View>
      </View>
    </>
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
    paddingTop: 50, // Adjusted for header height
  },

  header: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
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
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
});
