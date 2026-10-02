import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { components } from "@shared/api";
import { zustandStorage } from "@shared/storage";

export type Attempt = components["schemas"]["Attempt"];

const STORE_VERSION = 1;

interface OutboxState {
  attempts: Attempt[];
  enqueue: (attempt: Attempt) => void;
  remove: (attemptIds: readonly string[]) => void;
  reset: () => void;
}

const cellSchema = z.tuple([z.number().int(), z.number().int()]);

const attemptSchema = z.object({
  attemptId: z.string(),
  mode: z.enum(["campaign", "daily"]),
  ref: z.string(),
  contentVersion: z.string().optional(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  durationMs: z.number().int().optional(),
  taps: z.array(cellSchema),
  continued: z.boolean().optional(),
  continueMethod: z.string().nullable().optional(),
  claimed: z.object({
    result: z.enum(["won", "lost"]),
    movesUsed: z.number().int(),
    stars: z.number().int().nullable(),
  }),
}) satisfies z.ZodType<Attempt>;

// A broken record is dropped alone, so one bad attempt does not cost the rest of the queue (испорченная запись отбрасывается одна, чтобы не потерять остальную очередь).
const readAttempts = (persisted: unknown) => {
  const attempts =
    typeof persisted === "object" && persisted !== null && "attempts" in persisted
      ? persisted.attempts
      : [];
  if (!Array.isArray(attempts)) return [];
  return attempts.flatMap((attempt: unknown) => {
    const parsed = attemptSchema.safeParse(attempt);
    return parsed.success ? [parsed.data] : [];
  });
};

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set, get) => ({
      attempts: [],
      enqueue: (attempt) => set({ attempts: [...get().attempts, attempt] }),
      remove: (attemptIds) =>
        set({
          attempts: get().attempts.filter(({ attemptId }) => !attemptIds.includes(attemptId)),
        }),
      reset: () => set({ attempts: [] }),
    }),
    {
      name: "outbox",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ attempts }) => ({ attempts }),
      migrate: (persisted) => ({ attempts: readAttempts(persisted) }),
    },
  ),
);
