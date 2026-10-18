export interface WsSocket {
  send: (data: string) => void;
  close: () => void;
}

export interface WsSocketHandlers {
  onOpen: () => void;
  onMessage: (data: string) => void;
  onClose: (code: number, reason: string) => void;
}

export type WsTransport = (url: string, handlers: WsSocketHandlers) => WsSocket;
