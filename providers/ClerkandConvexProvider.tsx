import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Debug logging
console.log("Clerk Provider Setup:");
console.log(
  "CONVEX_URL:",
  process.env.EXPO_PUBLIC_CONVEX_URL ? "Set" : "Missing"
);
console.log("CLERK_KEY:", PUBLISHABLE_KEY ? "Set" : "Missing");

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function ClerkandConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <ClerkLoaded>{children}</ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
