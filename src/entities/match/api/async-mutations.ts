import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { AsyncFinish, AsyncMatch, AsyncTapResult, Cell } from "../model/async-type";

interface TapRequest {
  id: string;
  turn: number;
  cell: Cell;
}

export const startAsyncMatchMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "async", "start"],
    // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
    mutationFn: async () => readData(await apiClient.POST("/arena/async")) as AsyncMatch,
  });

export const tapAsyncMatchMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "async", "tap"],
    mutationFn: async ({ id, turn, cell }: TapRequest) =>
      // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
      readData(
        await apiClient.POST("/arena/async/{id}/tap", {
          params: { path: { id } },
          body: { turn, cell },
        }),
      ) as AsyncTapResult | AsyncFinish,
  });

export const surrenderAsyncMatchMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "async", "surrender"],
    mutationFn: async (id: string) =>
      // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
      readData(
        await apiClient.POST("/arena/async/{id}/surrender", { params: { path: { id } } }),
      ) as AsyncFinish,
  });
