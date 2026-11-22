import type { ChallengeStatus } from "@entities/challenge";

// An accepted challenge goes on in the match the server pushes; a cancel is the player's own (принятый вызов продолжается матчем, который присылает сервер; отмена — действие самого игрока).
const OUTCOME_TOAST_KEYS = {
  declined: "friends.challenge.cantNow",
  expired: "friends.challenge.noAnswer",
} as const;

export const outcomeToastKeyOf = (status: ChallengeStatus) =>
  status === "declined" || status === "expired" ? OUTCOME_TOAST_KEYS[status] : null;

export const isChallengeOver = (status: ChallengeStatus) => status !== "pending";
