import { QueryClient } from "@tanstack/react-query";

import type { PvpMap } from "../model/arena-map-type";

export const BRONZE_FORMAT = 5;

export const VALID_MAP: PvpMap = {
  rows: 5,
  cols: 5,
  targets: [[1, 3]],
  bombs: [[3, 1]],
  streams: [[2, 2]],
  fences: [
    [
      [0, 0],
      [0, 1],
    ],
  ],
};

export const TOO_MANY_BOMBS_MAP: PvpMap = {
  ...VALID_MAP,
  bombs: [
    [3, 1],
    [4, 4],
    [0, 4],
  ],
};

export const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
