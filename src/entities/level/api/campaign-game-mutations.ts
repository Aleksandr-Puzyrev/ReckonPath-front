import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";

interface Action {
  idempotencyKey: string;
}

interface PlayRequest extends Action {
  number: number;
  isRestart: boolean;
}

interface GameRequest extends Action {
  id: string;
}

interface TapRequest extends GameRequest {
  row: number;
  col: number;
  seq: number;
}

interface ContinueRequest extends GameRequest {
  seq: number;
}

interface TutorialRequest extends Action {
  key: string;
}

const headersOf = ({ idempotencyKey }: Action) => ({ "Idempotency-Key": idempotencyKey });

export const playCampaignLevelMutationOptions = () =>
  mutationOptions({
    mutationKey: ["campaign", "play"],
    mutationFn: async (request: PlayRequest) =>
      readData(
        await apiClient.POST("/campaign/levels/{number}/play", {
          params: { path: { number: request.number } },
          body: request.isRestart ? { restart: true } : {},
          headers: headersOf(request),
        }),
      ),
  });

export const tapCampaignGameMutationOptions = () =>
  mutationOptions({
    mutationKey: ["campaign", "tap"],
    mutationFn: async (request: TapRequest) =>
      readData(
        await apiClient.POST("/campaign/games/{id}/tap", {
          params: { path: { id: request.id } },
          body: { row: request.row, col: request.col, seq: request.seq },
          headers: headersOf(request),
        }),
      ),
  });

export const continueCampaignGameMutationOptions = () =>
  mutationOptions({
    mutationKey: ["campaign", "continue"],
    mutationFn: async (request: ContinueRequest) =>
      readData(
        await apiClient.POST("/campaign/games/{id}/continue", {
          params: { path: { id: request.id } },
          body: { seq: request.seq },
          headers: headersOf(request),
        }),
      ),
  });

export const giveUpCampaignGameMutationOptions = () =>
  mutationOptions({
    mutationKey: ["campaign", "giveUp"],
    mutationFn: async (request: GameRequest) =>
      readData(
        await apiClient.POST("/campaign/games/{id}/give-up", {
          params: { path: { id: request.id } },
          headers: headersOf(request),
        }),
      ),
  });

export const markTutorialMutationOptions = () =>
  mutationOptions({
    mutationKey: ["campaign", "tutorial"],
    mutationFn: async (request: TutorialRequest) =>
      readEmpty(
        await apiClient.POST("/campaign/tutorials", {
          body: { key: request.key },
          headers: headersOf(request),
        }),
      ),
  });
