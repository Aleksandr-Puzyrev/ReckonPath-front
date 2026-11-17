import { isApiError } from "@shared/api";
import type { ApiErrorCode } from "@shared/api";

import type { ServerGame } from "./server-game";

export const gameInError = <Game extends ServerGame>(
  error: unknown,
  code: ApiErrorCode,
): Game | null => {
  if (!isApiError(error) || error.code !== code) return null;
  const { details } = error;
  const isGame =
    typeof details.id === "string" &&
    typeof details.seq === "number" &&
    Array.isArray(details.cells) &&
    typeof details.board === "object";
  // The backend sends the game in the same shape as the answers of the request that failed (бэкенд присылает партию в той же форме, что и ответы упавшего запроса).
  return isGame ? (details as Game) : null;
};

// A repeated tap whose first answer was lost gets stale_game with the current game in its data (повторный тап, ответ на который потерялся, получает stale_game с текущей партией в данных).
export const freshGameOf = <Game extends ServerGame>(error: unknown) =>
  gameInError<Game>(error, "stale_game");
