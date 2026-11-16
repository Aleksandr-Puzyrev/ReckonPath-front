import { isApiError } from "@shared/api";

import type { CampaignGame } from "./campaign-types";

// A repeated tap whose first answer was lost gets stale_game with the current game in its data (повторный тап, ответ на который потерялся, получает stale_game с текущей партией в данных).
export const freshGameOf = (error: unknown): CampaignGame | null => {
  if (!isApiError(error) || error.code !== "stale_game") return null;
  const { details } = error;
  const isGame =
    typeof details.id === "string" &&
    typeof details.seq === "number" &&
    Array.isArray(details.cells) &&
    typeof details.board === "object";
  // The backend sends the game in the same shape as its answers (бэкенд присылает партию в той же форме, что и в ответах).
  return isGame ? (details as CampaignGame) : null;
};
