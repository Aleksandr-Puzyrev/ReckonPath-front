const DATE_PRECISION_MS = 1000;

let offsetMs = 0;
const listeners = new Set<() => void>();

// The Date header has whole seconds, so smaller changes are noise and must not re-render the clock users (заголовок Date точен до секунды, поэтому меньшие изменения — шум и не должны перерисовывать подписчиков).
export const recordServerDate = (date: string | null) => {
  if (date === null) return;
  const serverMs = Date.parse(date);
  if (Number.isNaN(serverMs)) return;
  const next = serverMs - Date.now();
  if (Math.abs(next - offsetMs) < DATE_PRECISION_MS) return;
  offsetMs = next;
  listeners.forEach((listener) => listener());
};

export const serverClockOffset = () => offsetMs;

export const subscribeServerClock = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
