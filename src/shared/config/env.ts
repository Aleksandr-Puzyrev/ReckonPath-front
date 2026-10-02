import Constants from "expo-constants";

const readAppVersion = () => {
  const version = Constants.expoConfig?.version;
  if (version === undefined) throw new Error("App version is missing from the app config");
  return version;
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
export const APP_VERSION = readAppVersion();
