import type { AppStateStatus } from "react-native";
import { uuidv7 } from "uuidv7";

import { CLOCK_SAMPLES, medianOffset, offsetSample } from "./clock-offset";
import type { ClientMessage, ServerMessage } from "./generated/messages";
import { createWsConnection } from "./ws-connection";
import type { WsConnection } from "./ws-connection";
import type { WsTransport } from "./ws-transport";

export const MATCH_BACKGROUND_CLOSE_MS = 5000;

const ENTRY_PATH = "/v1/ws";
const MATCH_PREFIX = "match.";

type ServerType = ServerMessage["t"];
type ClientType = Exclude<ClientMessage["t"], "ping">;
type MessageOf<T extends ServerType> = Extract<ServerMessage, { t: T }>;
type PayloadArgs<T extends ClientType> =
  Extract<ClientMessage, { t: T }> extends { d: infer D } ? [payload: D] : [];
type Handler = (message: ServerMessage) => void;

export type WsScope = "entry" | "match";

export interface WsStatus {
  scope: WsScope;
  isOpen: boolean;
}

export interface WsClosed {
  scope: WsScope;
  code: number;
  reason: string;
}

interface ClientOptions {
  transport: WsTransport;
  origin: string;
  accessToken: () => string | null;
  refreshToken: () => Promise<unknown>;
}

export type WsClient = ReturnType<typeof createWsClient>;

export const createWsClient = ({ transport, origin, accessToken, refreshToken }: ClientOptions) => {
  const handlers = new Map<ServerType, Set<Handler>>();
  const closedListeners = new Set<(closed: WsClosed) => void>();
  const statusListeners = new Set<(status: WsStatus) => void>();
  let offsets: number[] = [];
  let match: WsConnection | null = null;
  let backgroundTimer: ReturnType<typeof setTimeout> | null = null;
  let matchEndpoint = "";

  const emit = (message: ServerMessage) =>
    handlers.get(message.t)?.forEach((handler) => handler(message));

  const recordPong = (clientSentAt: number, serverTime: number) => {
    offsets = [...offsets, offsetSample(clientSentAt, serverTime, Date.now())].slice(
      -CLOCK_SAMPLES,
    );
  };

  const tokenQuery = () => {
    const token = accessToken();
    return token === null ? null : `token=${encodeURIComponent(token)}`;
  };

  const connectionOf = (scope: WsScope, buildUrl: (isResume: boolean) => string | null) =>
    createWsConnection({
      transport,
      isMatch: scope === "match",
      buildUrl,
      refreshToken,
      onMessage: emit,
      onPong: recordPong,
      onMoved: (endpoint) => {
        matchEndpoint = endpoint;
      },
      onClosed: (code, reason) =>
        closedListeners.forEach((listener) => listener({ scope, code, reason })),
      onStatus: (isOpen) => statusListeners.forEach((listener) => listener({ scope, isOpen })),
    });

  const entry = connectionOf("entry", () => {
    const query = tokenQuery();
    return query === null ? null : `${origin}${ENTRY_PATH}?${query}`;
  });

  const connections = () => (match === null ? [entry] : [entry, match]);

  const clearBackgroundTimer = () => {
    if (backgroundTimer !== null) clearTimeout(backgroundTimer);
    backgroundTimer = null;
  };

  return {
    connect: () => entry.open(),
    // Without a ticket the player returns to a running match, as after a reconnect (без билета игрок возвращается в идущий матч, как после переподключения).
    connectMatch: (endpoint: string, ticket: string | null) => {
      match?.close();
      matchEndpoint = endpoint;
      match = connectionOf("match", (isResume) => {
        if (!isResume && ticket !== null) {
          return `${matchEndpoint}?ticket=${encodeURIComponent(ticket)}`;
        }
        const query = tokenQuery();
        return query === null ? null : `${matchEndpoint}?${query}&resume=1`;
      });
      match.open();
    },
    leaveMatch: () => {
      match?.close();
      match = null;
    },
    disconnect: () => {
      clearBackgroundTimer();
      connections().forEach((connection) => connection.close());
      match = null;
    },
    on: <T extends ServerType>(type: T, handler: (message: MessageOf<T>) => void) => {
      // Handlers are stored by type, so only messages of this type reach this one (обработчики хранятся по типу, поэтому сюда приходят только сообщения этого типа).
      const stored = handler as Handler;
      const set = handlers.get(type) ?? new Set<Handler>();
      set.add(stored);
      handlers.set(type, set);
      return () => {
        set.delete(stored);
      };
    },
    onClosed: (listener: (closed: WsClosed) => void) => {
      closedListeners.add(listener);
      return () => {
        closedListeners.delete(listener);
      };
    },
    onStatus: (listener: (status: WsStatus) => void) => {
      statusListeners.add(listener);
      return () => {
        statusListeners.delete(listener);
      };
    },
    send: <T extends ClientType>(type: T, ...[payload]: PayloadArgs<T>) => {
      const id = uuidv7();
      const message = { t: type, id, ...(payload === undefined ? {} : { d: payload }) };
      const connection = type.startsWith(MATCH_PREFIX) ? match : entry;
      // The payload type is tied to its message type by PayloadArgs (тип данных связан с типом сообщения через PayloadArgs).
      const isSent = connection?.send(message as ClientMessage) ?? false;
      return isSent ? id : null;
    },
    serverNow: () => Date.now() + medianOffset(offsets),
    handleAppState: (state: AppStateStatus) => {
      clearBackgroundTimer();
      if (state === "active") {
        connections().forEach((connection) => connection.resume());
        return;
      }
      if (state !== "background") return;
      const suspendAll = () => connections().forEach((connection) => connection.suspend());
      if (match?.isActive() === true) {
        backgroundTimer = setTimeout(suspendAll, MATCH_BACKGROUND_CLOSE_MS);
        return;
      }
      suspendAll();
    },
  };
};
