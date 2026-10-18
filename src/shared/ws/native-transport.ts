import type { WsTransport } from "./ws-transport";

export const nativeTransport: WsTransport = (url, { onOpen, onMessage, onClose }) => {
  const socket = new WebSocket(url);
  socket.onopen = onOpen;
  socket.onmessage = ({ data }) => {
    if (typeof data === "string") onMessage(data);
  };
  socket.onclose = ({ code, reason }) => onClose(code, reason);
  return { send: (data) => socket.send(data), close: () => socket.close() };
};
