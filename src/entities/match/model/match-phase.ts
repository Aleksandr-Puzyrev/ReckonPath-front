import type { MatchView } from "./match-type";

export type MatchPhase = "prepare" | "versus" | "play" | "done";

export const matchPhaseOf = ({ status, startsAt }: MatchView, serverNow: number): MatchPhase => {
  if (status === "done") return "done";
  if (status === "prepare") return "prepare";
  return startsAt !== undefined && Date.parse(startsAt) > serverNow ? "versus" : "play";
};
