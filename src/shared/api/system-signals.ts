export type SystemSignal = "upgradeRequired" | "maintenance" | "banned";

type SystemSignalListener = (signal: SystemSignal, details: unknown) => void;

const listeners = new Set<SystemSignalListener>();

export const onSystemSignal = (listener: SystemSignalListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitSystemSignal = (signal: SystemSignal, details: unknown = undefined) => {
  listeners.forEach((listener) => listener(signal, details));
};
