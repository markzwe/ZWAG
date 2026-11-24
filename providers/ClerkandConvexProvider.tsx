import { useAppDataLoading } from "@/hooks/useAppDataLoading";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Component that handles data loading and splash screen
function AppDataLoader({ children }: { children: React.ReactNode }) {
  // This hook will handle splash screen hiding when data is ready
  useAppDataLoading();

  // Always render children - splash screen visibility is handled by the hook
  return <>{children}</>;
}

export default function ClerkandConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      {...(tokenCache && { tokenCache })}
      publishableKey={PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <AppDataLoader>{children}</AppDataLoader>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
