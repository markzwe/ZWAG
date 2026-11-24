import { useAccountStatus } from "@/hooks/useAccountStatus";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { COLORS } from "../../constants/theme";

export default function TabLayout() {
  const { loading, status } = useAccountStatus();
  if (loading) return null;
  if (!status?.canUseApp) return <Redirect href="/" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: COLORS.pureWhite,
          borderTopColor: COLORS.pureWhite,
          elevation: 1,
          height: 70,
        },
        tabBarPosition: "bottom",
        tabBarActiveTintColor: COLORS.pureWhite,
        tabBarInactiveTintColor: COLORS.mediumGray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Poppins_500Medium",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Closet",
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: "Poppins_500Medium",
            color: COLORS.black,
          },
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <MaterialCommunityIcons
                  name={focused ? "wardrobe" : "wardrobe-outline"}
                  size={27}
                  color={focused ? COLORS.black : COLORS.mediumGray}
                />
              </View>
            );
          },
          headerBackgroundContainerStyle: {
            backgroundColor: COLORS.darkGray,
          },
        }}
      />
      <Tabs.Screen
        name="recents"
        options={{
          tabBarLabel: "Fits",
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Ionicons
                  name={focused ? "refresh" : "refresh-outline"}
                  size={27}
                  color={focused ? COLORS.black : COLORS.mediumGray}
                />
              </View>
            );
          },
          headerBackgroundContainerStyle: {
            backgroundColor: COLORS.darkGray,
          },
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarStyle: {display: "none"},
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: COLORS.darkGray,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -20,
                  elevation: 4,
                  shadowColor: COLORS.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }}
              >
                <Ionicons
                  name={focused ? "sparkles" : "sparkles-outline"}
                  size={40}
                  color={COLORS.pureWhite}
                />
              </View>
            );
          },
        }}
      />
    </Tabs>
  );
}
