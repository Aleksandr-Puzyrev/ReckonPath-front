import { mutationOptions } from "@tanstack/react-query";
import { Platform } from "react-native";

import { apiClient, readData, readErrorEnvelope } from "@shared/api";
import type { ApiSession, components } from "@shared/api";

import { readDeviceId, readRefreshToken, saveRefreshToken } from "../model/secure-session";
import { useSessionStore } from "../model/session-store";

type TokenPair = components["schemas"]["TokenPair"];
type ApiPlatform = components["schemas"]["Platform"];

let signingIn: Promise<string> | null = null;

const keepTokens = async ({ accessToken, refreshToken }: TokenPair) => {
  await saveRefreshToken(refreshToken);
  useSessionStore.getState().setAccessToken(accessToken);
  return accessToken;
};

const requestGuestSession = async () => {
  try {
    const deviceId = await readDeviceId();
    const platform: ApiPlatform = Platform.OS === "ios" ? "ios" : "android";
    // TODO: send the App Attest / Play Integrity token once modules/app-integrity exists
    const body = { deviceId, platform, integrityToken: "" };
    return await keepTokens(readData(await apiClient.POST("/auth/guest", { body })));
  } finally {
    signingIn = null;
  }
};

// Launch, reconnect and a revoked refresh can ask at once; they share one sign-in (запуск, появление сети и отозванный refresh могут попросить вход одновременно — он общий).
const signInGuest = async () => {
  signingIn ??= requestGuestSession();
  return signingIn;
};

export const hasSavedSession = async () => (await readRefreshToken()) !== null;

export const ensureSession = async () => {
  if ((await readRefreshToken()) !== null) return;
  await signInGuest();
};

const refreshAccessToken = async () => {
  const refreshToken = await readRefreshToken();
  // A request that failed during the first sign-in waits for its token (запрос, упавший во время первого входа, ждёт его токен).
  if (refreshToken === null) return signingIn;
  const result = await apiClient.POST("/auth/refresh", { body: { refreshToken } });
  if (readErrorEnvelope(result.error).code !== "SESSION_REVOKED")
    return keepTokens(readData(result));
  // The revoked token stays until the new guest replaces it, so a failed sign-in is retried by the next 401 (отозванный токен остаётся до замены новым гостем, и неудачный вход повторит следующий 401).
  useSessionStore.getState().reset();
  return signInGuest();
};

export const apiSession: ApiSession = {
  getAccessToken: () => useSessionStore.getState().accessToken,
  refreshAccessToken,
};

export const ensureSessionMutationOptions = () =>
  mutationOptions({ mutationKey: ["session", "ensure"], mutationFn: ensureSession });
