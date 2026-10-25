import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 1;
// A few dozen levels are enough: there are at most 20 saved ones (хватит нескольких десятков уровней: сохранённых не больше 20).
const KEPT_LEVELS = 40;

interface TryoutBestState {
  best: Record<string, number>;
  record: (levelCode: string, moves: number) => void;
  reset: () => void;
}

const bestSchema = z.record(z.string(), z.number().int().positive());

// The author's best tryout result per exact level, keyed by its code, so an edit drops the old result (лучший результат автора для конкретного уровня по его коду: правка уровня сбрасывает старый результат).
export const useTryoutBestStore = create<TryoutBestState>()(
  persist(
    (set, get) => ({
      best: {},
      record: (levelCode, moves) => {
        const previous = get().best[levelCode];
        if (previous !== undefined && previous <= moves) return;
        const entries = Object.entries({ ...get().best, [levelCode]: moves });
        set({ best: Object.fromEntries(entries.slice(-KEPT_LEVELS)) });
      },
      reset: () => set({ best: {} }),
    }),
    {
      name: "tryout-best",
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
