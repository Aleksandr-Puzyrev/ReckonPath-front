import { useEffect } from "react";

import { HAS_ARENA_SERVER } from "@shared/config";
import { arenaSocket } from "@shared/ws";

import { loadCurrentMatch } from "../api/match-queries";

import { createMatchSession } from "./match-session";

export const matchSession = createMatchSession(arenaSocket, loadCurrentMatch);

export const useMatchEvents = () => {
  useEffect(() => (HAS_ARENA_SERVER ? matchSession.retain() : undefined), []);
};
