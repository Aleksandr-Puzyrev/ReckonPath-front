import type { ArenaEvent } from "../ws";

type EventListener = (event: ArenaEvent) => void;

const eventListeners = new Set<EventListener>();
const reconnectListeners = new Set<() => void>();

// Stands in for the arena socket in tests: pushes and reconnects are injected by hand (заменяет сокет арены в тестах: пуши и переподключения подаются вручную).
export const mockArenaSocket = {
  isOpen: false,
  open: () => {
    mockArenaSocket.isOpen = true;
  },
  close: () => {
    mockArenaSocket.isOpen = false;
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
  push: (event: ArenaEvent) => eventListeners.forEach((listener) => listener(event)),
  reconnect: () => reconnectListeners.forEach((listener) => listener()),
};
