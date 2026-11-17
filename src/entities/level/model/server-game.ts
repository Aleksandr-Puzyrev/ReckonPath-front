import type { CampaignGame, Secrets } from "./campaign-types";

// The campaign and the daily answer with the same game parts; the board needs only these (кампания и дейли отвечают одинаковыми частями партии; полю нужны только они).
export type ServerGame = Pick<
  CampaignGame,
  "id" | "seq" | "status" | "board" | "moves" | "limit" | "found" | "bombsLeft" | "epoch" | "cells"
> & {
  continues?: number;
  result?: { stars: number; secrets?: Secrets };
};
