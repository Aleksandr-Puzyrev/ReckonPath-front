import type { WsTransport } from "../../../ws/ws-transport";

import { fakeGameServer } from "./fake-game-server";
import type { FakePeer } from "./fake-game-server";

const NORMAL_CLOSE = 1000;

// Every hop is asynchronous, like a real network (каждый шаг асинхронный, как в настоящей сети).
const later = (run: () => void) => {
  setTimeout(run, 0);
};

export const fakeTransport: WsTransport = (url, { onOpen, onMessage, onClose }) => {
  let isClosed = false;
  let connection: ReturnType<typeof fakeGameServer.connect> | null = null;

  const shut = (code: number, reason: string) => {
    if (isClosed) return;
    isClosed = true;
    connection?.disconnect();
    later(() => onClose(code, reason));
  };

  const peer: FakePeer = {
    deliver: (message) =>
      later(() => {
        if (!isClosed) onMessage(JSON.stringify(message));
      }),
    close: shut,
  };

  later(() => {
    if (isClosed) return;
    onOpen();
    connection = fakeGameServer.connect(url, peer);
  });

  return {
    send: (data) =>
      later(() => {
        if (!isClosed) connection?.receive(data);
      }),
    close: () => shut(NORMAL_CLOSE, ""),
  };
};
