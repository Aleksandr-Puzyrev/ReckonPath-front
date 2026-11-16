import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Idx } from "@reckon-path/engine";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 1;

interface CampaignFlags {
  gameId: string | null;
  flags: Idx[];
}

interface CampaignFlagsState extends CampaignFlags {
  toggle: (gameId: string, cell: Idx) => void;
  remove: (gameId: string, cell: Idx) => void;
  reset: () => void;
}

const INITIAL: CampaignFlags = { gameId: null, flags: [] };
const NO_FLAGS: Idx[] = [];
const flagsSchema = z.object({
  gameId: z.string().nullable(),
  flags: z.array(z.number().int()),
});

// Flags belong to the device and to one server game; another game starts without them (флажки принадлежат устройству и одной партии сервера; другая партия начинается без них).
export const useCampaignFlagsStore = create<CampaignFlagsState>()(
  persist(
    (set, get) => {
      const flagsOf = (gameId: string) => (get().gameId === gameId ? get().flags : []);
      return {
        ...INITIAL,
        toggle: (gameId, cell) => {
          const flags = flagsOf(gameId);
          set({
            gameId,
            flags: flags.includes(cell) ? flags.filter((flag) => flag !== cell) : [...flags, cell],
          });
        },
        remove: (gameId, cell) =>
          set({ gameId, flags: flagsOf(gameId).filter((flag) => flag !== cell) }),
        reset: () => set(INITIAL),
      };
    },
    {
      name: "campaign-flags",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ gameId, flags }): CampaignFlags => ({ gameId, flags }),
      migrate: (persisted) => flagsSchema.catch(INITIAL).parse(persisted),
    },
  ),
);

export const selectCampaignFlags = (gameId: string | null) => (state: CampaignFlagsState) =>
  gameId !== null && state.gameId === gameId ? state.flags : NO_FLAGS;
