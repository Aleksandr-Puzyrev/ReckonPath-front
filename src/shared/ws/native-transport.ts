import type { WsTransport } from "./ws-transport";

type NativeWebSocket = new (
  url: string,
  protocols: null,
  options: { headers: Record<string, string> },
) => WebSocket;

// React Native's WebSocket takes headers as the third argument (react-native/Libraries/WebSocket/WebSocket.js), but the DOM typings know only two; the token goes in Authorization, not in the URL (WebSocket в React Native принимает заголовки третьим аргументом, но DOM-типы знают только два; токен идёт в Authorization, а не в URL).
const NativeSocket = WebSocket as unknown as NativeWebSocket;

export const nativeTransport: WsTransport = (url, headers, { onOpen, onMessage, onClose }) => {
  const socket = new NativeSocket(url, null, { headers });
  socket.onopen = onOpen;
  socket.onmessage = ({ data }) => {
    if (typeof data === "string") onMessage(data);
  };
  socket.onclose = ({ code }) => onClose(code);
  return { close: () => socket.close() };
};
