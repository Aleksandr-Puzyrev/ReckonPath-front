import Constants from "expo-constants";
import { Platform } from "react-native";

const readAppVersion = () => {
  const version = Constants.expoConfig?.version;
  if (version === undefined) throw new Error("App version is missing from the app config");
  return version;
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
// The arena runs only on the server: a dev build without a backend address shows a notice instead (арена работает только на сервере: dev-сборка без адреса бэкенда показывает вместо неё заглушку).
export const HAS_ARENA_SERVER = !__DEV__ || API_BASE_URL !== "";
// The guest has no server to hand out an ad unit, so its rewarded unit comes from the build (у гостя нет сервера, который выдал бы рекламный блок, поэтому его блок берётся из сборки).
export const GUEST_REWARDED_UNIT_ID =
  (Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_REWARDED_UNIT_ID_IOS
    : process.env.EXPO_PUBLIC_REWARDED_UNIT_ID_ANDROID) ?? "";
export const APP_VERSION = readAppVersion();
