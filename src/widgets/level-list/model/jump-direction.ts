export type JumpDirection = "up" | "down";

export const jumpDirectionOf = (
  currentIndex: number | null,
  visibleIndexes: readonly number[],
): JumpDirection | null => {
  if (currentIndex === null || visibleIndexes.length === 0) return null;
  if (visibleIndexes.includes(currentIndex)) return null;
  return currentIndex < Math.min(...visibleIndexes) ? "up" : "down";
};
