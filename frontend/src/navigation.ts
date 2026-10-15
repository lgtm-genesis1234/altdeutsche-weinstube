import { Platform } from "react-native";

// iOS 26+ gets Liquid Glass NativeTabs; everything else uses the classic JS bar.
export const usesNativeTabs =
  Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;
