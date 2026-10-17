import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 1;

interface InterstitialProgress {
  firstLaunchAt: number | null;
  finishedLevels: number;
  lastAdAt: number | null;
}

interface InterstitialState extends InterstitialProgress {
  isPreloaded: boolean;
  setPreloaded: (isPreloaded: boolean) => void;
  markLaunched: (now: number) => void;
  countFinishedLevel: () => void;
  noteAdShown: (now: number) => void;
  markInterstitialShown: (now: number) => void;
  reset: () => void;
}

const INITIAL: InterstitialProgress = { firstLaunchAt: null, finishedLevels: 0, lastAdAt: null };

const progressSchema = z.object({
  firstLaunchAt: z.number().nullable(),
  finishedLevels: z.number().int().nonnegative(),
  lastAdAt: z.number().nullable(),
});

export const useInterstitialStore = create<InterstitialState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      isPreloaded: false,
      setPreloaded: (isPreloaded) => set({ isPreloaded }),
      markLaunched: (now) => {
        if (get().firstLaunchAt === null) set({ firstLaunchAt: now });
      },
      countFinishedLevel: () => set({ finishedLevels: get().finishedLevels + 1 }),
      noteAdShown: (now) => set({ lastAdAt: now }),
      markInterstitialShown: (now) => set({ finishedLevels: 0, lastAdAt: now, isPreloaded: false }),
      reset: () => set({ ...INITIAL, isPreloaded: false }),
    }),
    {
      name: "interstitial",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ firstLaunchAt, finishedLevels, lastAdAt }): InterstitialProgress => ({
        firstLaunchAt,
        finishedLevels,
        lastAdAt,
      }),
      migrate: (persisted) => progressSchema.catch(INITIAL).parse(persisted),
    },
  ),
);
