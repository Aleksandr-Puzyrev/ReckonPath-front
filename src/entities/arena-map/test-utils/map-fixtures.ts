import { QueryClient } from "@tanstack/react-query";

import type { PvpMap } from "../model/arena-map-type";

export const BRONZE_FORMAT = 5;

export const VALID_MAP: PvpMap = {
  rows: 5,
  cols: 5,
  targets: [[2, 2]],
  bombs: [
    [0, 0],
    [4, 4],
  ],
  streams: [
    [1, 2],
    [2, 1],
    [3, 2],
  ],
};

export const TOO_MANY_BOMBS_MAP: PvpMap = {
  ...VALID_MAP,
  bombs: [
    [0, 0],
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
