import { AppState } from "react-native";

import { WS_CLOSE, ws } from "@shared/ws";
import type { ClientMessage, ServerMessage } from "@shared/ws";

import type { Cell } from "./match-reducer";
import { useMatchStore } from "./match-store";

type Emote = Extract<ClientMessage, { t: "match.emote" }>["d"]["emote"];

const SERVER_TYPES: readonly ServerMessage["t"][] = [
  "queue.status",
  "match.found",
  "match.state",
  "match.turn",
  "match.tapResult",
  "match.opponent",
  "match.emote",
  "match.snapshot",
  "match.end",
  "error",
];

let unbind: (() => void) | null = null;

const store = () => useMatchStore.getState();

const handleFound = (message: ServerMessage) => {
  if (message.t !== "match.found") return;
  ws.connectMatch(message.d.endpoint, message.d.ticket);
};

const handleBackground = (state: string) => {
  if (state !== "background" || store().phase !== "searching") return;
  ws.send("queue.leave");
  store().stopSearch();
};

// The store listens to the socket outside React and changes only on server messages (стор слушает сокет вне React и меняется только по сообщениям сервера).
const bind = () => {
  if (unbind !== null) return;
  const offMessages = SERVER_TYPES.map((type) =>
    ws.on(type, (message: ServerMessage) => {
      store().receive(message);
      handleFound(message);
    }),
  );
  const offClosed = ws.onClosed(({ scope, code }) => {
    if (scope === "match") store().markLost();
    else if (store().phase === "searching") {
      store().failSearch(code === WS_CLOSE.BANNED ? "BANNED" : "NETWORK");
    }
  });
  const offStatus = ws.onStatus(({ scope, isOpen }) => {
    if (scope === "match") store().setReconnecting(!isOpen);
  });
  const appState = AppState.addEventListener("change", handleBackground);
  unbind = () => {
    offMessages.forEach((off) => off());
    offClosed();
    offStatus();
    appState.remove();
    unbind = null;
  };
};

export const matchSession = {
  search: (format: number, mapId: string) => {
    bind();
    store().startSearch();
    ws.connect();
    ws.send("queue.join", { format, mapId });
  },
  training: (format: number) => {
    bind();
    store().startTraining();
    ws.connect();
    ws.send("queue.join", { format, mode: "training" });
  },
  cancelSearch: () => {
    ws.send("queue.leave");
    store().reset();
  },
  returnTo: (endpoint: string) => {
    bind();
    store().reset();
    ws.connect();
    ws.connectMatch(endpoint, null);
  },
  tap: (cell: Cell) => {
    const { turn } = store();
    store().setPendingCell(cell);
    ws.send("match.tap", { turn, cell });
  },
  emote: (emote: Emote) => ws.send("match.emote", { emote }),
  surrender: () => ws.send("match.surrender"),
  leave: () => {
    ws.leaveMatch();
    ws.disconnect();
    unbind?.();
    store().reset();
  },
};
