export type MatchOutcome = "win" | "loss" | "draw";
export type MatchKind = "ranked" | "bot" | "async" | "friendly";

export const REDUCED_REWARD_SHARE = 0.5;

export const isReduced = (kind: MatchKind) => kind === "bot" || kind === "async";
