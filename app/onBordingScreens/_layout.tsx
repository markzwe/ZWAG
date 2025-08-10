import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="styleQuestionnaire" />
      </Stack>
    </OnboardingProvider>
  );
}
