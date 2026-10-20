import type { MatchEnd, MatchTap } from "@entities/match";

export type TrainingHint = "first" | "turns" | "bomb" | "won" | "lost";

export const trainingHintOf = (myTaps: readonly MatchTap[], end: MatchEnd | null): TrainingHint => {
  if (end !== null) return end.result === "win" ? "won" : "lost";
  if (myTaps.some(({ outcome }) => outcome === "bomb")) return "bomb";
  return myTaps.length === 0 ? "first" : "turns";
};
