import { reconnectDelay } from "./reconnect-delay";
import { parseArenaEvent } from "./arena-event";
import type { ArenaEvent } from "./arena-event";
import type { WsSocket, WsTransport } from "./ws-transport";

export const WS_CLOSE_TOKEN = 4001;

interface SocketOptions {
  transport: WsTransport;
  url: string;
  headers: () => Record<string, string> | null;
  isTokenExpired: () => boolean;
  refreshToken: () => Promise<unknown>;
}

type EventListener = (event: ArenaEvent) => void;

export type ArenaSocket = ReturnType<typeof createArenaSocket>;

// The server only pushes: every action is a REST request, so the socket is opened, read and reopened (сервер только присылает: все действия — REST-запросы, поэтому сокет открывается, читается и переоткрывается).
export const createArenaSocket = ({
  transport,
  url,
  headers,
  isTokenExpired,
  refreshToken,
}: SocketOptions) => {
  const eventListeners = new Set<EventListener>();
  const reconnectListeners = new Set<() => void>();
  let socket: WsSocket | null = null;
  let isWanted = false;
  let hasConnected = false;
  let isTokenRefreshed = false;
  let isRefreshing = false;
  let attempt = 0;
  let retry: ReturnType<typeof setTimeout> | null = null;

  const stopRetry = () => {
    if (retry !== null) clearTimeout(retry);
    retry = null;
  };

  const drop = () => {
    stopRetry();
    const current = socket;
    socket = null;
    current?.close();
  };

  const handleOpen = () => {
    attempt = 0;
    isTokenRefreshed = false;
    if (hasConnected) reconnectListeners.forEach((listener) => listener());
    hasConnected = true;
  };

  const handleMessage = (data: string) => {
    const event = parseArenaEvent(data);
    if (event !== null) eventListeners.forEach((listener) => listener(event));
  };

  const scheduleReconnect = () => {
    if (!isWanted) return;
    retry = setTimeout(connect, reconnectDelay(attempt));
    attempt += 1;
  };

  // No token after a refresh means the session is gone; a failed refresh (network, 5xx) is retried with the backoff (без токена после обновления сессии нет; неудачное обновление — сеть, 5xx — повторяется с отступом).
  const refreshThenConnect = async () => {
    isRefreshing = true;
    let token: unknown;
    try {
      token = await refreshToken();
    } catch {
      isRefreshing = false;
      isTokenRefreshed = false;
      scheduleReconnect();
      return;
    }
    isRefreshing = false;
    if (token === null) {
      isWanted = false;
      return;
    }
    connect();
  };

  // One refresh per drop: a second 4001 right after it means the session is gone (одно обновление на обрыв: второй 4001 сразу после него значит, что сессии нет).
  const reconnectWithFreshToken = async () => {
    if (isTokenRefreshed) {
      isWanted = false;
      return;
    }
    isTokenRefreshed = true;
    await refreshThenConnect();
  };

  const handleClose = (code: number) => {
    socket = null;
    if (!isWanted) return;
    if (code === WS_CLOSE_TOKEN) {
      void reconnectWithFreshToken();
      return;
    }
    scheduleReconnect();
  };

  const connect = () => {
    stopRetry();
    if (!isWanted || socket !== null || isRefreshing) return;
    // An expired token would only earn a 4001, so it is refreshed before the socket opens (истёкший токен принёс бы только 4001, поэтому он обновляется до открытия сокета).
    if (isTokenExpired() && !isTokenRefreshed) {
      void reconnectWithFreshToken();
      return;
    }
    const current = headers();
    if (current === null) {
      isWanted = false;
      return;
    }
    const opened = transport(url, current, {
      onOpen: () => {
        if (socket === opened) handleOpen();
      },
      onMessage: (data) => {
        if (socket === opened) handleMessage(data);
      },
      onClose: (code) => {
        if (socket === opened) handleClose(code);
      },
    });
    socket = opened;
  };

  return {
    open: () => {
      if (isWanted) return;
      isWanted = true;
      connect();
    },
    close: () => {
      isWanted = false;
      hasConnected = false;
      drop();
    },
    suspend: () => {
      if (isWanted) drop();
    },
    resume: () => {
      if (isWanted && socket === null) connect();
    },
    onEvent: (listener: EventListener) => {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },
    onReconnect: (listener: () => void) => {
      reconnectListeners.add(listener);
      return () => {
        reconnectListeners.delete(listener);
      };
    },
  };
};
