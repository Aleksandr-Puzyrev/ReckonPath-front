import { mutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { apiClient, readData, readEmpty } from "@shared/api";

import { storeEventAttempt } from "./competition-queries";

const writeHeaders = () => ({ "Idempotency-Key": uuidv7() });

const joinEvent = async (code: string) =>
  readData(
    await apiClient.POST("/events/{code}/join", {
      params: { path: { code } },
      headers: writeHeaders(),
    }),
  );

export const joinEventOptions = (code: string) =>
  mutationOptions({ mutationFn: () => joinEvent(code) });

export const playEventOptions = (code: string) =>
  mutationOptions({
    // Joining twice is a no-op. The event response does not expose membership.
    mutationFn: async (id: string) => {
      await joinEvent(code);
      return readData(
        await apiClient.POST("/events/{code}/maps/{id}/play", {
          params: { path: { code, id } },
          headers: writeHeaders(),
        }),
      );
    },
  });

interface EventTap {
  seq: number;
  cell: number;
  idempotencyKey: string;
}

export const tapEventOptions = (code: string, id: string) =>
  mutationOptions({
    mutationFn: async ({ seq, cell, idempotencyKey }: EventTap) =>
      readData(
        await apiClient.POST("/events/{code}/attempts/{id}/tap", {
          params: { path: { code, id } },
          headers: { "Idempotency-Key": idempotencyKey },
          body: { seq, cell },
        }),
      ),
  });

export const claimEventOptions = (code: string) =>
  mutationOptions({
    mutationFn: async () =>
      readEmpty(
        await apiClient.POST("/events/{code}/claim", {
          params: { path: { code } },
          headers: writeHeaders(),
        }),
      ),
  });

export const claimAchievementOptions = () =>
  mutationOptions({
    mutationFn: async (id: string) =>
      readEmpty(
        await apiClient.POST("/me/achievements/{id}/claim", {
          params: { path: { id } },
          headers: writeHeaders(),
        }),
      ),
  });

export const useJoinEvent = (code: string) => useMutation(joinEventOptions(code));
export const usePlayEvent = (code: string) => useMutation(playEventOptions(code));
export const useTapEvent = (code: string, id: string) => {
  const client = useQueryClient();
  return useMutation({
    ...tapEventOptions(code, id),
    networkMode: "always",
    onSuccess: (attempt) => storeEventAttempt(client, code, attempt),
  });
};
export const useClaimEvent = (code: string) => useMutation(claimEventOptions(code));
export const useClaimAchievement = () => useMutation(claimAchievementOptions());
