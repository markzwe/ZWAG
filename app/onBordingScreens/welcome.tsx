import { View, Text, Touchable, TouchableOpacity, Button } from "react-native";
import React from "react";
import { router } from "expo-router";

export default function Welcome() {
  return (
    <View>
      <Text>Welcome</Text>
      <Text>Welcome to RammyLive!</Text>
      <Text>Get ready to explore and enjoy the app.</Text>
      <Text>Let's get started!</Text>
      <Text>Click the button below to continue.</Text>

      <Button
        onPress={() => router.push("/(auth)/sign-up")}
        title="Get Started"
      />
      <Button onPress={() => router.push("/(auth)/sign-in")} title="Sign In" />
      <Button onPress={() => router.push("/(tabs)")} title="Skip" />
    </View>
  );
}
