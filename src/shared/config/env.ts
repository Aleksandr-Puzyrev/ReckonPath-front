import Constants from "expo-constants";
import { Platform } from "react-native";

const readAppVersion = () => {
  const version = Constants.expoConfig?.version;
  if (version === undefined) throw new Error("App version is missing from the app config");
  return version;
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL ?? "";
// The guest has no server to hand out an ad unit, so its rewarded unit comes from the build (у гостя нет сервера, который выдал бы рекламный блок, поэтому его блок берётся из сборки).
export const GUEST_REWARDED_UNIT_ID =
  (Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_REWARDED_UNIT_ID_IOS
    : process.env.EXPO_PUBLIC_REWARDED_UNIT_ID_ANDROID) ?? "";
export const APP_VERSION = readAppVersion();
