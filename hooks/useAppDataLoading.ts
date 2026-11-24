import { useAuth } from "@clerk/clerk-expo";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { clearLocalChat } from "@/lib/localChatStorage";
import { useAccountStatus } from "./useAccountStatus";

export function useAppDataLoading() {
  const { userId } = useAuth();
  const { status, loading } = useAccountStatus();

  useEffect(() => {
    // Once Clerk has mounted the app, an on-screen loader can show connection progress.
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (userId && (status?.deleting || status?.deleted)) {
      void clearLocalChat(userId).catch(() => console.warn("Could not clear local chat."));
    }
  }, [userId, status?.deleting, status?.deleted]);

  return { isAppReady: !loading, isLoading: loading };
}
