export interface WsSocket {
  close: () => void;
}

export interface WsSocketHandlers {
  onOpen: () => void;
  onMessage: (data: string) => void;
  onClose: (code: number) => void;
}

export type WsTransport = (
  url: string,
  headers: Record<string, string>,
  handlers: WsSocketHandlers,
) => WsSocket;
