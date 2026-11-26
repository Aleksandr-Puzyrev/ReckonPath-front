import Constants from "expo-constants";
import { Platform } from "react-native";

const readAppVersion = () => {
  const version = Constants.expoConfig?.version;
  if (version === undefined) throw new Error("App version is missing from the app config");
  return version;
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
// The arena runs only on the server: a dev build without a backend address shows a notice instead (арена работает только на сервере: dev-сборка без адреса бэкенда показывает вместо неё заглушку).
export const HAS_BACKEND = !__DEV__ || API_BASE_URL !== "";
export const HAS_FCM =
  HAS_BACKEND &&
  ((Platform.OS === "android" && Constants.expoConfig?.extra?.androidFcm === true) ||
    (Platform.OS === "ios" && Constants.expoConfig?.extra?.iosFcm === true));
export const HAS_ARENA_SERVER = HAS_BACKEND;
export const APP_VERSION = readAppVersion();
