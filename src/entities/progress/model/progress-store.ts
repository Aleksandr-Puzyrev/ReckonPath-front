import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Stars } from "@reckon-path/engine";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 1;

export interface LevelBest {
  stars: Stars | null;
  moves: number;
}

interface ProgressState {
  best: Record<string, LevelBest>;
  recordWin: (levelId: string, result: LevelBest) => boolean;
  reset: () => void;
}

const isBetter = (result: LevelBest, previous: LevelBest) =>
  (result.stars ?? 0) > (previous.stars ?? 0) ||
  ((result.stars ?? 0) === (previous.stars ?? 0) && result.moves < previous.moves);

const bestSchema = z.record(
  z.string(),
  z.object({
    stars: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable(),
    moves: z.number().int(),
  }),
);

// TODO: sync with the server by max stars once attempts:batch exists
export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      best: {},

      recordWin: (levelId, result) => {
        const previous = get().best[levelId];
        if (previous !== undefined && !isBetter(result, previous)) return false;

        set({ best: { ...get().best, [levelId]: result } });
        return previous !== undefined;
      },

      reset: () => set({ best: {} }),
    }),
    {
      name: "progress",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ best }) => ({ best }),
      migrate: (persisted) => ({
        best: bestSchema
          .catch({})
          .parse(
            typeof persisted === "object" && persisted !== null && "best" in persisted
              ? persisted.best
              : {},
          ),
      }),
    },
  ),
);
