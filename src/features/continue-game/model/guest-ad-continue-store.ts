import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 1;

interface GuestAdContinue {
  dayKey: string | null;
  used: number;
}

interface GuestAdContinueState extends GuestAdContinue {
  usedOn: (dayKey: string) => number;
  countUse: (dayKey: string) => void;
  reset: () => void;
}

const INITIAL: GuestAdContinue = { dayKey: null, used: 0 };

const progressSchema = z.object({
  dayKey: z.string().nullable(),
  used: z.number().int().nonnegative(),
});

// The guest's ad continues of the day, counted on the device because there is no server (рекламные продолжения гостя за день, считаются на устройстве: сервера нет).
export const useGuestAdContinueStore = create<GuestAdContinueState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      usedOn: (dayKey) => (get().dayKey === dayKey ? get().used : 0),
      countUse: (dayKey) => set({ dayKey, used: get().usedOn(dayKey) + 1 }),
      reset: () => set(INITIAL),
    }),
    {
      name: "guest-ad-continue",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ dayKey, used }): GuestAdContinue => ({ dayKey, used }),
      migrate: (persisted) => progressSchema.catch(INITIAL).parse(persisted),
    },
  ),
);
