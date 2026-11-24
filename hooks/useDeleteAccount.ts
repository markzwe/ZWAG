import { api } from "@/convex/_generated/api";
import { clearLocalChat } from "@/lib/localChatStorage";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { Alert } from "react-native";

export function useDeleteAccount() {
  const { userId } = useAuth();
  const { user } = useUser();
  const deleteAccount = useMutation(api.accountDeletion.deleteAccount);
  const [requesting, setRequesting] = useState(false);

  async function requestDeletion() {
    if (!userId || requesting) return;
    setRequesting(true);
    try {
      await deleteAccount({});
      try {
        await clearLocalChat(userId);
      } catch {
        Alert.alert("Local chat", "ZWAG couldn't clear the local chat on this device.");
      }
    } catch (error) {
      Alert.alert("Deletion could not start",
        error instanceof ConvexError && typeof error.data === "string" ? error.data : "Try again when you're connected.");
    } finally {
      setRequesting(false);
    }
  }

  function confirmDeletion() {
    const usedApple = user?.externalAccounts.some(account => account.provider === "apple");
    const appleInstructions = usedApple
      ? "\n\nTo also remove ZWAG’s Sign in with Apple authorization, go to Settings → Apple Account → Sign in with Apple."
      : "";
    Alert.alert("Delete your account?",
      "This permanently removes your account, closet, photos, saved outfits, and outfit activity." + appleInstructions, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete account", style: "destructive", onPress: () => void requestDeletion() },
    ]);
  }

  return { requesting, confirmDeletion, requestDeletion };
}
