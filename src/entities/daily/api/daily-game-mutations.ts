import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

interface Action {
  idempotencyKey: string;
}

interface PlayRequest extends Action {
  isRestart: boolean;
}

interface TapRequest extends Action {
  id: string;
  row: number;
  col: number;
  seq: number;
}

const headersOf = ({ idempotencyKey }: Action) => ({ "Idempotency-Key": idempotencyKey });

export const playDailyMutationOptions = () =>
  mutationOptions({
    mutationKey: ["daily", "play"],
    mutationFn: async (request: PlayRequest) =>
      readData(
        await apiClient.POST("/daily/play", {
          body: request.isRestart ? { restart: true } : {},
          headers: headersOf(request),
        }),
      ),
  });

export const tapDailyGameMutationOptions = () =>
  mutationOptions({
    mutationKey: ["daily", "tap"],
    mutationFn: async (request: TapRequest) =>
      readData(
        await apiClient.POST("/daily/games/{id}/tap", {
          params: { path: { id: request.id } },
          body: { row: request.row, col: request.col, seq: request.seq },
          headers: headersOf(request),
        }),
      ),
  });
