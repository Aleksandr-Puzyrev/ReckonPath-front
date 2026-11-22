import { useServerClock } from "./use-server-clock";

const MINUTE_MS = 60_000;

export const useServerMinute = () => useServerClock(MINUTE_MS);
