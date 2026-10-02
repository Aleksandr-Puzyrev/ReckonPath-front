import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 2;
const KEPT_DAYS = 40;

const dailyRecordSchema = z.object({
  attemptId: z.string(),
  result: z.enum(["won", "lost"]),
  movesUsed: z.number().int(),
  stars: z.number().int().nullable(),
  durationMs: z.number().int(),
  rank: z.number().int().nullable(),
  percentile: z.number().int().nullable(),
  // Version 1 had no ranked flag; unknown until the server answers again (в версии 1 флага не было; неизвестен до нового ответа сервера).
  ranked: z.boolean().nullable().default(null),
});

export type DailyRecord = z.infer<typeof dailyRecordSchema>;
type CountedAttempt = Omit<DailyRecord, "rank" | "percentile" | "ranked">;

interface ServerPlace {
  rank: number | null;
  percentile: number | null;
  ranked: boolean | null;
}

interface DailyRecordState {
  days: Record<string, DailyRecord>;
  recordCounted: (dayKey: string, attempt: CountedAttempt) => void;
  recordPlace: (attemptId: string, place: ServerPlace) => void;
  reset: () => void;
}

const keepRecent = (days: Record<string, DailyRecord>) =>
  Object.fromEntries(
    Object.entries(days)
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, KEPT_DAYS),
  );

// The first finished attempt of a day is the counted one; replays never replace it (первая завершённая попытка дня — зачётная, переигровки её не заменяют).
export const useDailyRecordStore = create<DailyRecordState>()(
  persist(
    (set, get) => ({
      days: {},
      recordCounted: (dayKey, attempt) => {
        if (get().days[dayKey] !== undefined) return;
        set({
          days: keepRecent({
            ...get().days,
            [dayKey]: { ...attempt, rank: null, percentile: null, ranked: null },
          }),
        });
      },
      recordPlace: (attemptId, place) => {
        const entry = Object.entries(get().days).find(([, day]) => day.attemptId === attemptId);
        if (entry === undefined) return;
        const [dayKey, day] = entry;
        set({ days: { ...get().days, [dayKey]: { ...day, ...place } } });
      },
      reset: () => set({ days: {} }),
    }),
    {
      name: "daily-records",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ days }) => ({ days }),
      migrate: (persisted) => ({
        days: z
          .record(z.string(), dailyRecordSchema)
          .catch({})
          .parse(
            typeof persisted === "object" && persisted !== null && "days" in persisted
              ? persisted.days
              : {},
          ),
      }),
    },
  ),
);
