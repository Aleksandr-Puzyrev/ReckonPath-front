const DELAYS_MS = [500, 1000, 2000, 4000] as const;
const MAX_DELAY_MS = 4000;
const JITTER_SHARE = 0.2;

export const reconnectDelay = (attempt: number, random: () => number = Math.random) => {
  const base = DELAYS_MS[Math.min(attempt, DELAYS_MS.length - 1)] ?? MAX_DELAY_MS;
  return Math.round(base * (1 + JITTER_SHARE * random()));
};
