export type SystemSignal = "upgradeRequired" | "maintenance";

type SystemSignalListener = (signal: SystemSignal) => void;

const listeners = new Set<SystemSignalListener>();

export const onSystemSignal = (listener: SystemSignalListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitSystemSignal = (signal: SystemSignal) => {
  listeners.forEach((listener) => listener(signal));
};
