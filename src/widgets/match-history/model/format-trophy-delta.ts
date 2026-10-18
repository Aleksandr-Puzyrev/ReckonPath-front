const MINUS = "−";

export const formatTrophyDelta = (delta: number) => {
  if (delta > 0) return `+${delta}`;
  return delta < 0 ? `${MINUS}${Math.abs(delta)}` : "0";
};
