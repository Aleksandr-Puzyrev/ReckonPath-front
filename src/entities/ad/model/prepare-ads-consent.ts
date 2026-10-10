import {
  PermissionStatus,
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import { Platform } from "react-native";

import { useAdsConsentStore } from "./ads-consent-store";

let preScreenClosed: (() => void) | null = null;
let asking: Promise<boolean> | null = null;

const showPreScreen = () =>
  new Promise<void>((resolve) => {
    preScreenClosed = resolve;
    useAdsConsentStore.getState().openPreScreen();
  });

export const confirmPreScreen = () => useAdsConsentStore.getState().closePreScreen();

// iOS drops the system request while a modal is still closing, so it waits for the pre-screen to leave (iOS отбрасывает системный запрос, пока модальное окно ещё закрывается, поэтому он ждёт ухода пред-экрана).
export const handlePreScreenClosed = () => {
  preScreenClosed?.();
  preScreenClosed = null;
};

const ask = async () => {
  const { status } = await getTrackingPermissionsAsync();
  if (status !== PermissionStatus.UNDETERMINED) return status === PermissionStatus.GRANTED;
  await showPreScreen();
  const { granted } = await requestTrackingPermissionsAsync();
  return granted;
};

const askOnce = async () => {
  try {
    return await ask();
  } finally {
    asking = null;
  }
};

// Returns whether ads may be personalised; iOS asks once with the pre-screen first (ADS-08); concurrent callers share one question (возвращает, можно ли персонализировать рекламу; iOS спрашивает один раз, сначала пред-экран; одновременные вызовы делят один вопрос).
export const prepareAdsConsent = async () => {
  if (Platform.OS !== "ios") return true;
  asking ??= askOnce();
  return asking;
};
