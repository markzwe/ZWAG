import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useConvexAuth, useQuery } from "convex/react";

export function useAccountStatus() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const status = useQuery(api.users.getAccountStatus, isAuthenticated && isSignedIn ? {} : "skip");
  return {
    status,
    signedIn: isSignedIn === true,
    loading: !isLoaded || (isSignedIn === true && (isLoading || (isAuthenticated && status === undefined))),
  };
}
