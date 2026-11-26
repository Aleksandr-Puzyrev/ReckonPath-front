import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const cell = z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]);
const attempt = z.object({
  id: z.string(),
  packId: z.string(),
  level: z.number().int().positive(),
  version: z.number().int().positive(),
  startedAt: z.string(),
  taps: z.array(cell),
});

const pack = z.object({
  packId: z.string(),
  expiresAt: z.string(),
  clockOffset: z.number().default(0),
  completed: z.array(z.number().int()).default([]),
  levels: z.array(
    z.object({
      number: z.number().int(),
      version: z.number().int(),
      nonce: z.string(),
      data: z.string(),
    }),
  ),
});

const schema = z.object({
  owner: z.string().nullable(),
  pack: pack.nullable(),
  active: attempt.nullable(),
  pending: z.array(attempt.extend({ finishedAt: z.string(), won: z.boolean() })),
  rejected: z.number().int().nonnegative(),
});

type OfflineData = z.infer<typeof schema>;
export type OfflineAttempt = z.infer<typeof attempt>;
export type CampaignPack = z.infer<typeof pack>;
export type PendingAttempt = OfflineData["pending"][number];

const EMPTY: OfflineData = { owner: null, pack: null, active: null, pending: [], rejected: 0 };

interface OfflineCampaignState extends OfflineData {
  syncBlocked: boolean;
  setSyncBlocked: (blocked: boolean) => void;
  bind: (owner: string) => void;
  setPack: (pack: CampaignPack | null) => void;
  advanceTo: (level: number) => void;
  save: (attempt: OfflineAttempt) => void;
  finish: (attempt: PendingAttempt) => void;
  confirm: (results: readonly { id: string; status: string }[]) => void;
  clearRejections: () => void;
  reset: () => void;
}

export const useOfflineCampaign = create<OfflineCampaignState>()(
  persist(
    (set) => ({
      ...EMPTY,
      syncBlocked: false,
      setSyncBlocked: (syncBlocked) => set({ syncBlocked }),
      bind: (owner) =>
        set((state) => (state.owner === owner ? state : { ...EMPTY, owner, syncBlocked: false })),
      setPack: (pack) =>
        set((state) => ({
          pack,
          active: state.active?.packId === pack?.packId ? state.active : null,
        })),
      advanceTo: (level) =>
        set((state) => {
          if (state.pack === null || level <= 0) return state;
          const completed = new Set(state.pack.completed);
          for (const entry of state.pack.levels)
            if (entry.number < level) completed.add(entry.number);
          return completed.size === state.pack.completed.length
            ? state
            : { pack: { ...state.pack, completed: [...completed] } };
        }),
      save: (active) => set({ active }),
      finish: (result) =>
        set((state) => ({
          active: null,
          pending: [...state.pending.filter(({ id }) => id !== result.id), result],
        })),
      confirm: (results) =>
        set((state) => {
          const byId = new Map(results.map((result) => [result.id, result.status]));
          const completed = new Set(state.pack?.completed);
          for (const item of state.pending) {
            if (item.packId === state.pack?.packId && byId.get(item.id) === "won")
              completed.add(item.level);
          }
          return {
            ...(state.pack === null ? {} : { pack: { ...state.pack, completed: [...completed] } }),
            pending: state.pending.filter(({ id }) => !byId.has(id)),
            rejected:
              state.rejected + state.pending.filter(({ id }) => byId.get(id) === "rejected").length,
          };
        }),
      clearRejections: () => set({ rejected: 0 }),
      reset: () => set({ ...EMPTY, syncBlocked: false }),
    }),
    {
      name: "offline-campaign",
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ owner, pack, active, pending, rejected }) => ({
        owner,
        pack,
        active,
        pending,
        rejected,
      }),
      migrate: (persisted) => schema.catch(EMPTY).parse(persisted),
      merge: (persisted, current) => ({ ...current, ...schema.catch(EMPTY).parse(persisted) }),
    },
  ),
);
