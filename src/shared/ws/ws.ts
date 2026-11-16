import { AppState } from "react-native";

import { accessToken, isAccessTokenExpired, refreshAccessToken } from "@shared/api";
import { API_BASE_URL } from "@shared/config";
import { i18n } from "@shared/i18n";

import { createArenaSocket } from "./arena-socket";
import { nativeTransport } from "./native-transport";

const ARENA_WS_PATH = "/v1/arena/ws";

const headers = () => {
  const token = accessToken();
  if (token === null) return null;
  return { Authorization: `Bearer ${token}`, "Accept-Language": i18n.language };
};

export const arenaSocket = createArenaSocket({
  transport: nativeTransport,
  url: `${API_BASE_URL.replace(/^http/, "ws")}${ARENA_WS_PATH}`,
  headers,
  isTokenExpired: isAccessTokenExpired,
  refreshToken: refreshAccessToken,
});

AppState.addEventListener("change", (state) => {
  if (state === "active") arenaSocket.resume();
  else if (state === "background") arenaSocket.suspend();
});
