import { onlineManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";

import { HAS_ARENA_SERVER } from "@shared/config";
import { arenaSocket } from "@shared/ws";

import { loadCurrentMatch } from "../api/match-queries";

import { createMatchSession } from "./match-session";

const onWake = (listener: () => void) => {
  const appState = AppState.addEventListener("change", (state) => {
    if (state === "active") listener();
  });
  const offOnline = onlineManager.subscribe((isOnline) => {
    if (isOnline) listener();
  });
  return () => {
    appState.remove();
    offOnline();
  };
};

export const matchSession = createMatchSession(arenaSocket, loadCurrentMatch, onWake);

export const useMatchEvents = () => {
  useEffect(() => (HAS_ARENA_SERVER ? matchSession.retain() : undefined), []);
};
