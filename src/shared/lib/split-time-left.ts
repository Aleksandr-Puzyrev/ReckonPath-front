const MINUTE_MS = 60_000;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

export const splitTimeLeft = (ms: number) => {
  const minutes = Math.max(0, Math.floor(ms / MINUTE_MS));
  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  return {
    days: Math.floor(hours / HOURS_IN_DAY),
    hours: hours % HOURS_IN_DAY,
    minutes: minutes % MINUTES_IN_HOUR,
  };
};
