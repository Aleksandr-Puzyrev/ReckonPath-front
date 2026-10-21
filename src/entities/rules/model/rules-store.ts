import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

import { RULE_DEMOS } from "./rule-cards";
import type { RuleCardId } from "./rule-cards";

const STORE_VERSION = 2;

export type TutorialState = "pending" | "done" | "skipped";

interface RulesProgress {
  seenCards: RuleCardId[];
  tutorial: TutorialState;
  hasSeenMovesHint: boolean;
  hasSeenHomeTour: boolean;
}

interface RulesState extends RulesProgress {
  markSeen: (ids: readonly RuleCardId[]) => void;
  finishTutorial: () => void;
  skipTutorial: () => void;
  markMovesHintSeen: () => void;
  markHomeTourSeen: () => void;
  reset: () => void;
}

const INITIAL: RulesProgress = {
  seenCards: [],
  tutorial: "pending",
  hasSeenMovesHint: false,
  hasSeenHomeTour: false,
};

export const isRuleCardId = (id: string): id is RuleCardId => Object.hasOwn(RULE_DEMOS, id);

const progressSchema = z.object({
  seenCards: z.array(z.string()).transform((ids) => ids.filter(isRuleCardId)),
  tutorial: z.enum(["pending", "done", "skipped"]),
  hasSeenMovesHint: z.boolean(),
  // Version 1 had no Home tour; those players have not seen it yet (в версии 1 тура по главной не было; эти игроки его ещё не видели).
  hasSeenHomeTour: z.boolean().default(false),
});

export const useRulesStore = create<RulesState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      markSeen: (ids) => set({ seenCards: [...new Set([...get().seenCards, ...ids])] }),
      finishTutorial: () => set({ tutorial: "done" }),
      skipTutorial: () => set({ tutorial: "skipped" }),
      markMovesHintSeen: () => set({ hasSeenMovesHint: true }),
      markHomeTourSeen: () => set({ hasSeenHomeTour: true }),
      reset: () => set(INITIAL),
    }),
    {
      name: "rules",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ seenCards, tutorial, hasSeenMovesHint, hasSeenHomeTour }): RulesProgress => ({
        seenCards,
        tutorial,
        hasSeenMovesHint,
        hasSeenHomeTour,
      }),
      migrate: (persisted) => progressSchema.catch(INITIAL).parse(persisted),
    },
  ),
);

export const unseenCards = (ids: readonly RuleCardId[], seen: readonly RuleCardId[]) =>
  ids.filter((id) => !seen.includes(id));
