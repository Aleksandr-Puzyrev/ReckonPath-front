import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

import type { CustomDraft, CustomMap, CustomParams } from "./custom-level-type";

const STORE_VERSION = 1;
const HISTORY_STEPS = 30;

export interface LevelEditorSession {
  levelId: string;
  draft: CustomDraft;
  saved: CustomDraft | null;
  past: CustomMap[];
  future: CustomMap[];
}

interface LevelEditorState {
  session: LevelEditorSession | null;
  strokeBase: CustomMap | null;
  open: (levelId: string, initial: CustomDraft, saved: CustomDraft | null) => void;
  apply: (map: CustomMap) => void;
  beginStroke: () => void;
  strokeTo: (map: CustomMap) => void;
  endStroke: () => void;
  undo: () => void;
  redo: () => void;
  setTitle: (title: string) => void;
  setParams: (params: Partial<CustomParams>) => void;
  markSaved: (levelId: string) => void;
  reset: () => void;
}

const cellSchema = z.tuple([z.number().int(), z.number().int()]);
const cellsSchema = z.array(cellSchema).optional();
const mapSchema = z.object({
  rows: z.number().int(),
  cols: z.number().int(),
  targets: z.array(cellSchema),
  bombs: cellsSchema,
  streams: cellsSchema,
  bridges: cellsSchema,
  heavy: cellsSchema,
  rocks: cellsSchema,
  fences: z.array(z.tuple([cellSchema, cellSchema])).optional(),
  beacons: cellsSchema,
  buoys: cellsSchema,
});
const draftSchema = z.object({
  title: z.string(),
  map: mapSchema,
  params: z.object({
    probeMode: z.enum(["distance", "direction", "hotcold"]),
    fog: z.number().int().nullable(),
    isTargetOrder: z.boolean(),
    hasBombHint: z.boolean(),
    moveLimit: z.number().int().nullable(),
  }),
});
const sessionSchema = z.object({
  levelId: z.string(),
  draft: draftSchema,
  saved: draftSchema.nullable(),
  past: z.array(mapSchema),
  future: z.array(mapSchema),
});

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export const isDraftDirty = ({ draft, saved }: LevelEditorSession) =>
  saved === null ? draft.map.targets.length > 0 : !same(draft, saved);

const pushed = (past: readonly CustomMap[], map: CustomMap) => [...past, map].slice(-HISTORY_STEPS);

export const useLevelEditorStore = create<LevelEditorState>()(
  persist(
    (set, get) => {
      const update = (change: (session: LevelEditorSession) => Partial<LevelEditorSession>) => {
        const { session } = get();
        if (session !== null) set({ session: { ...session, ...change(session) } });
      };
      const withMap = (session: LevelEditorSession, map: CustomMap) => ({
        draft: { ...session.draft, map },
      });

      return {
        session: null,
        strokeBase: null,

        open: (levelId, initial, saved) => {
          if (get().session?.levelId === levelId) return;
          set({
            session: { levelId, draft: initial, saved, past: [], future: [] },
            strokeBase: null,
          });
        },

        apply: (map) =>
          update((session) =>
            same(map, session.draft.map)
              ? {}
              : {
                  ...withMap(session, map),
                  past: pushed(session.past, session.draft.map),
                  future: [],
                },
          ),

        beginStroke: () => set({ strokeBase: get().session?.draft.map ?? null }),

        strokeTo: (map) => update((session) => withMap(session, map)),

        // A whole drag is one history step (весь штрих пальцем — один шаг истории).
        endStroke: () => {
          const { strokeBase } = get();
          set({ strokeBase: null });
          if (strokeBase === null) return;
          update((session) =>
            same(strokeBase, session.draft.map)
              ? {}
              : { past: pushed(session.past, strokeBase), future: [] },
          );
        },

        undo: () =>
          update((session) => {
            const previous = session.past.at(-1);
            if (previous === undefined) return {};
            return {
              ...withMap(session, previous),
              past: session.past.slice(0, -1),
              future: [session.draft.map, ...session.future],
            };
          }),

        redo: () =>
          update((session) => {
            const [next, ...rest] = session.future;
            if (next === undefined) return {};
            return {
              ...withMap(session, next),
              past: pushed(session.past, session.draft.map),
              future: rest,
            };
          }),

        setTitle: (title) => update((session) => ({ draft: { ...session.draft, title } })),

        setParams: (params) =>
          update((session) => ({
            draft: { ...session.draft, params: { ...session.draft.params, ...params } },
          })),

        markSaved: (levelId) => update((session) => ({ levelId, saved: session.draft })),

        reset: () => set({ session: null, strokeBase: null }),
      };
    },
    {
      name: "level-editor",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ session }) => ({ session }),
      migrate: (persisted) => ({
        session: sessionSchema
          .nullable()
          .catch(null)
          .parse(
            typeof persisted === "object" && persisted !== null && "session" in persisted
              ? persisted.session
              : null,
          ),
      }),
    },
  ),
);
