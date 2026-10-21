import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AppLanguage } from "@shared/i18n";
import { zustandStorage } from "@shared/storage";
import type { ThemeChoice } from "@shared/theme";

const STORE_VERSION = 2;
export const VOLUME_MAX = 100;
export const VOLUME_STEP = 5;
// The design 25.1 levels a switched-on channel comes back to (уровни дизайна 25.1, к которым возвращается включённый канал).
const SOUND_LEVEL = 80;
const MUSIC_LEVEL = 40;

export type VolumeChannel = "sound" | "music";

const volumeSchema = z.number().int().min(0).max(VOLUME_MAX);

const settingsSchema = z.object({
  volume: z.object({ sound: volumeSchema, music: volumeSchema }),
  lastVolume: z.object({ sound: volumeSchema, music: volumeSchema }),
  isVibrationOn: z.boolean(),
  isCoordinatesOn: z.boolean(),
  isPvpTapConfirmOn: z.boolean(),
  isRivalSkinsOn: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["ru", "en"]).nullable(),
});

type Settings = z.infer<typeof settingsSchema>;

const DEFAULTS: Settings = {
  volume: { sound: SOUND_LEVEL, music: 0 },
  lastVolume: { sound: SOUND_LEVEL, music: MUSIC_LEVEL },
  isVibrationOn: true,
  isCoordinatesOn: true,
  isPvpTapConfirmOn: false,
  isRivalSkinsOn: true,
  theme: "system",
  language: null,
};

const v1Schema = z.object({
  isSoundOn: z.boolean(),
  isMusicOn: z.boolean(),
  isVibrationOn: z.boolean(),
});

const migrateV1 = (persisted: unknown): Settings => {
  const v1 = v1Schema
    .catch({ isSoundOn: true, isMusicOn: false, isVibrationOn: true })
    .parse(persisted);
  return {
    ...DEFAULTS,
    volume: { sound: v1.isSoundOn ? SOUND_LEVEL : 0, music: v1.isMusicOn ? MUSIC_LEVEL : 0 },
    isVibrationOn: v1.isVibrationOn,
  };
};

interface SettingsState extends Settings {
  setVolume: (channel: VolumeChannel, level: number) => void;
  toggleVolume: (channel: VolumeChannel) => void;
  toggleVibration: () => void;
  toggleCoordinates: () => void;
  togglePvpTapConfirm: () => void;
  toggleRivalSkins: () => void;
  setTheme: (theme: ThemeChoice) => void;
  setLanguage: (language: AppLanguage) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      setVolume: (channel, level) => {
        const { volume, lastVolume } = get();
        set({
          volume: { ...volume, [channel]: level },
          lastVolume: level > 0 ? { ...lastVolume, [channel]: level } : lastVolume,
        });
      },
      toggleVolume: (channel) => {
        const { volume, lastVolume } = get();
        set({ volume: { ...volume, [channel]: volume[channel] > 0 ? 0 : lastVolume[channel] } });
      },
      toggleVibration: () => set({ isVibrationOn: !get().isVibrationOn }),
      toggleCoordinates: () => set({ isCoordinatesOn: !get().isCoordinatesOn }),
      togglePvpTapConfirm: () => set({ isPvpTapConfirmOn: !get().isPvpTapConfirmOn }),
      toggleRivalSkins: () => set({ isRivalSkinsOn: !get().isRivalSkinsOn }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: "settings",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({
        volume,
        lastVolume,
        isVibrationOn,
        isCoordinatesOn,
        isPvpTapConfirmOn,
        isRivalSkinsOn,
        theme,
        language,
      }): Settings => ({
        volume,
        lastVolume,
        isVibrationOn,
        isCoordinatesOn,
        isPvpTapConfirmOn,
        isRivalSkinsOn,
        theme,
        language,
      }),
      migrate: (persisted, version) =>
        version < STORE_VERSION
          ? migrateV1(persisted)
          : settingsSchema.catch(DEFAULTS).parse(persisted),
    },
  ),
);
