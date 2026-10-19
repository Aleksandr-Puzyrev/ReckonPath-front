import { serverMessageSchema } from "./generated/messages";
import type { ClientMessage, ServerMessage } from "./generated/messages";
import { reconnectDelay } from "./reconnect-delay";
import { checkSeq } from "./seq-order";
import { WS_CLOSE } from "./ws-close";
import type { WsSocket, WsTransport } from "./ws-transport";

export const PING_INTERVAL_MS = 5000;
export const PONG_TIMEOUT_MS = 10_000;
export const MATCH_RECONNECT_LIMIT_MS = 30_000;

const TERMINAL_CODES: ReadonlySet<number> = new Set([
  WS_CLOSE.BANNED,
  WS_CLOSE.OTHER_DEVICE,
  WS_CLOSE.UPGRADE,
  WS_CLOSE.MAINTENANCE,
]);

interface ConnectionOptions {
  transport: WsTransport;
  isMatch: boolean;
  buildUrl: (isResume: boolean) => string | null;
  refreshToken: () => Promise<unknown>;
  onMessage: (message: ServerMessage) => void;
  onPong: (clientSentAt: number, serverTime: number) => void;
  onMoved: (endpoint: string) => void;
  onClosed: (code: number, reason: string) => void;
  onStatus: (isOpen: boolean) => void;
}

export type WsConnection = ReturnType<typeof createWsConnection>;

export const createWsConnection = (options: ConnectionOptions) => {
  let socket: WsSocket | null = null;
  let isOpen = false;
  let isWanted = false;
  let hasConnected = false;
  let attempt = 0;
  let droppedAt: number | null = null;
  let lastPongAt = 0;
  let lastSeq: number | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let retry: ReturnType<typeof setTimeout> | null = null;
  let isResyncing = false;
  let isTokenRefreshed = false;

  let outbox: ClientMessage[] = [];

  // Messages sent while (re)connecting wait for the socket instead of getting lost (сообщения, отправленные во время подключения, ждут сокет, а не теряются).
  const send = (message: ClientMessage) => {
    if (socket !== null && isOpen) {
      socket.send(JSON.stringify(message));
      return true;
    }
    if (!isWanted) return false;
    outbox = [...outbox, message];
    return true;
  };

  const flush = () => {
    const waiting = outbox;
    outbox = [];
    waiting.forEach(send);
  };

  const stopTimers = () => {
    if (heartbeat !== null) clearInterval(heartbeat);
    if (retry !== null) clearTimeout(retry);
    heartbeat = null;
    retry = null;
  };

  const dropSocket = () => {
    stopTimers();
    const current = socket;
    socket = null;
    isOpen = false;
    current?.close();
  };

  const giveUp = (code: number, reason: string) => {
    isWanted = false;
    dropSocket();
    options.onClosed(code, reason);
  };

  const beat = () => {
    if (Date.now() - lastPongAt >= PONG_TIMEOUT_MS) {
      dropSocket();
      options.onStatus(false);
      scheduleReconnect(WS_CLOSE.ABNORMAL, "");
      return;
    }
    send({ t: "ping", d: { c: Date.now() } });
  };

  const deliver = (message: ServerMessage) => {
    if (message.t === "pong") {
      lastPongAt = Date.now();
      isTokenRefreshed = false;
      options.onPong(message.d.c, message.d.s);
      return;
    }
    if (!options.isMatch) {
      options.onMessage(message);
      return;
    }
    if (message.t === "match.snapshot") {
      isResyncing = false;
      lastSeq = message.seq ?? lastSeq;
      options.onMessage(message);
      return;
    }
    const verdict = checkSeq(lastSeq, "seq" in message ? message.seq : undefined);
    if (verdict === "gap" && !isResyncing) {
      isResyncing = send({ t: "match.resync" });
    }
    if (verdict !== "deliver") return;
    if ("seq" in message && message.seq !== undefined) lastSeq = message.seq;
    options.onMessage(message);
  };

  const handleMessage = (data: string) => {
    let json: unknown;
    try {
      json = JSON.parse(data);
    } catch {
      // TODO: report malformed WebSocket messages to Sentry once it is set up
      return;
    }
    const parsed = serverMessageSchema.safeParse(json);
    // TODO: report invalid WebSocket messages to Sentry once it is set up
    if (parsed.success) deliver(parsed.data);
  };

  const handleOpen = () => {
    const isResume = hasConnected;
    isOpen = true;
    options.onStatus(true);
    hasConnected = true;
    attempt = 0;
    droppedAt = null;
    lastPongAt = Date.now();
    heartbeat = setInterval(beat, PING_INTERVAL_MS);
    send({ t: "ping", d: { c: Date.now() } });
    isResyncing = isResume && options.isMatch && send({ t: "match.resync" });
    flush();
  };

  const connect = () => {
    stopTimers();
    if (!isWanted || socket !== null) return;
    const url = options.buildUrl(hasConnected);
    if (url === null) {
      giveUp(WS_CLOSE.TOKEN, "");
      return;
    }
    const opened = options.transport(url, {
      onOpen: () => {
        if (socket === opened) handleOpen();
      },
      onMessage: (data) => {
        if (socket === opened) handleMessage(data);
      },
      onClose: (code, reason) => {
        if (socket === opened) handleClose(code, reason);
      },
    });
    socket = opened;
  };

  const scheduleReconnect = (code: number, reason: string) => {
    if (!isWanted) return;
    droppedAt ??= Date.now();
    if (options.isMatch && Date.now() - droppedAt >= MATCH_RECONNECT_LIMIT_MS) {
      giveUp(code, reason);
      return;
    }
    retry = setTimeout(connect, reconnectDelay(attempt));
    attempt += 1;
  };

  // One refresh per drop: a second 4001 right after it means the session is gone (одно обновление на обрыв: второй 4001 сразу после него значит, что сессии нет).
  const reconnectWithFreshToken = async () => {
    if (isTokenRefreshed) {
      giveUp(WS_CLOSE.TOKEN, "");
      return;
    }
    isTokenRefreshed = true;
    try {
      await options.refreshToken();
    } catch {
      giveUp(WS_CLOSE.TOKEN, "");
      return;
    }
    connect();
  };

  const handleClose = (code: number, reason: string) => {
    stopTimers();
    socket = null;
    isOpen = false;
    if (!isWanted) return;
    options.onStatus(false);
    if (TERMINAL_CODES.has(code)) {
      giveUp(code, reason);
      return;
    }
    if (code === WS_CLOSE.TOKEN) {
      void reconnectWithFreshToken();
      return;
    }
    if (code === WS_CLOSE.MOVED) {
      options.onMoved(reason);
      connect();
      return;
    }
    scheduleReconnect(code, reason);
  };

  return {
    open: () => {
      if (isWanted) return;
      isWanted = true;
      connect();
    },
    close: () => {
      isWanted = false;
      outbox = [];
      dropSocket();
    },
    suspend: () => {
      if (isWanted) dropSocket();
    },
    resume: () => {
      if (isWanted && socket === null) connect();
    },
    send,
    isActive: () => isWanted,
  };
};
