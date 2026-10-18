export const CLOCK_SAMPLES = 5;

export const offsetSample = (clientSentAt: number, serverTime: number, receivedAt: number) =>
  serverTime - (clientSentAt + (receivedAt - clientSentAt) / 2);

export const medianOffset = (samples: readonly number[]) => {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] ?? 0;
  if (sorted.length % 2 === 1) return upper;
  return ((sorted[middle - 1] ?? upper) + upper) / 2;
};
