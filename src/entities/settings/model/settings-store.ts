import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 1;

interface Settings {
  isSoundOn: boolean;
  isMusicOn: boolean;
  isVibrationOn: boolean;
}

interface SettingsState extends Settings {
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleVibration: () => void;
  reset: () => void;
}

// Sound on and music off, as in the design's pause sheet (звук включён, музыка выключена — как в паузе дизайна).
const DEFAULTS: Settings = { isSoundOn: true, isMusicOn: false, isVibrationOn: true };

const settingsSchema = z.object({
  isSoundOn: z.boolean(),
  isMusicOn: z.boolean(),
  isVibrationOn: z.boolean(),
});

// TODO: theme, language, and coordinates join with the settings screen
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      toggleSound: () => set({ isSoundOn: !get().isSoundOn }),
      toggleMusic: () => set({ isMusicOn: !get().isMusicOn }),
      toggleVibration: () => set({ isVibrationOn: !get().isVibrationOn }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: "settings",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ isSoundOn, isMusicOn, isVibrationOn }): Settings => ({
        isSoundOn,
        isMusicOn,
        isVibrationOn,
      }),
      migrate: (persisted) => settingsSchema.catch(DEFAULTS).parse(persisted),
    },
  ),
);
