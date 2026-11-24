import { useAccountStatus } from "@/hooks/useAccountStatus";
import { Redirect, Slot } from "expo-router";

export default function AppScreensLayout() {
  const { loading, status } = useAccountStatus();
  if (loading) return null;
  if (!status?.canUseApp) return <Redirect href="/" />;
  return <Slot />;
}
