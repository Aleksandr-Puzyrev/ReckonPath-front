import { Platform } from "react-native";

import { installerPackageName } from "@modules/install-source";

export type InstallStore = "appStore" | "playMarket" | "ruStore";

const RUSTORE_PACKAGE = "ru.vk.store";

export const installStoreOf = (os: string, installer: () => string | null): InstallStore => {
  if (os === "ios") return "appStore";
  return installer() === RUSTORE_PACKAGE ? "ruStore" : "playMarket";
};

// Read once: the store that installed the app does not change while it runs (читается один раз: магазин, из которого установлено приложение, не меняется, пока оно работает).
export const INSTALL_STORE = installStoreOf(Platform.OS, installerPackageName);
