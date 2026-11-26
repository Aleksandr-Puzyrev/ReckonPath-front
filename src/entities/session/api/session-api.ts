import * as Device from "expo-device";
import { Platform } from "react-native";

import {
  apiClient,
  clearCurrentPushTokens,
  isApiError,
  isSessionRevoked,
  readData,
  readEmpty,
  readErrorEnvelope,
  runCurrentPushOperation,
} from "@shared/api";
import type { ApiSession, components } from "@shared/api";
import { APP_VERSION, HAS_FCM } from "@shared/config";

import { useAccountStore } from "../model/account-store";
import {
  deleteRefreshToken,
  readDeviceId,
  readRefreshToken,
  saveRefreshToken,
} from "../model/secure-session";
import { useSessionStore } from "../model/session-store";

type TokenPair = components["schemas"]["TokenPair"];
type DeviceInfo = components["schemas"]["DeviceInfo"];

const MS_PER_SECOND = 1000;

const keepTokens = async ({ accessToken, refreshToken, expiresIn }: TokenPair) => {
  await saveRefreshToken(refreshToken);
  useSessionStore.getState().setAccessToken(accessToken, Date.now() + expiresIn * MS_PER_SECOND);
  return accessToken;
};

// A guest lives on the device: a token left by an older build belongs to no account (гость живёт на устройстве: токен от старой сборки не принадлежит аккаунту).
const accountRefreshToken = async () =>
  useAccountStore.getState().hasLogin ? readRefreshToken() : null;

const becomeGuest = async () => {
  await deleteRefreshToken();
  useSessionStore.getState().reset();
};

export const hasSavedSession = async () => (await accountRefreshToken()) !== null;

export const deviceInfo = async (): Promise<DeviceInfo> => ({
  deviceId: await readDeviceId(),
  platform: Platform.OS === "ios" ? "ios" : "android",
  name: Device.modelName ?? undefined,
  appVersion: APP_VERSION,
});

const refreshAccessToken = async () => {
  const refreshToken = await accountRefreshToken();
  if (refreshToken === null) return null;
  const result = await apiClient.POST("/auth/refresh", { body: { refreshToken } });
  if (!isSessionRevoked(readErrorEnvelope(result.error).code)) return keepTokens(readData(result));
  await becomeGuest();
  useAccountStore.getState().loseSignIn();
  return null;
};

// The token is dropped first, so the start looks like a new sign-in and the attempts sync runs (токен сначала сбрасывается: старт выглядит как новый вход и запускает синхронизацию попыток).
export const startSession = async (tokens: TokenPair) => {
  useSessionStore.getState().reset();
  await keepTokens(tokens);
};

// The server has already ended every session, as after the account's deletion (сервер уже завершил все сессии, как после удаления аккаунта).
export const leaveAccount = async () => {
  await becomeGuest();
  useAccountStore.getState().reset();
};

const endAccountSession = (route: "/auth/logout" | "/auth/logout-all") => {
  const revoke = async () => {
    readEmpty(await apiClient.POST(route));
    await leaveAccount();
  };
  if (!HAS_FCM) return revoke();
  return runCurrentPushOperation(async () => {
    try {
      await clearCurrentPushTokens();
    } catch (error) {
      if (!isApiError(error) || error.code !== "no_device") throw error;
    }
    await revoke();
  });
};

export const endSession = () => endAccountSession("/auth/logout");

export const endEverySession = () => endAccountSession("/auth/logout-all");

export const apiSession: ApiSession = {
  getAccessToken: () => useSessionStore.getState().accessToken,
  isAccessTokenExpired: () => useSessionStore.getState().isExpired(),
  refreshAccessToken,
  hasAccount: () => useAccountStore.getState().hasLogin,
  subscribeAccount: (listener) => useAccountStore.subscribe(listener),
};
