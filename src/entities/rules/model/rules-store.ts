import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

import { RULE_DEMOS } from "./rule-cards";
import type { RuleCardId } from "./rule-cards";

const STORE_VERSION = 1;

export type TutorialState = "pending" | "done" | "skipped";

interface RulesProgress {
  seenCards: RuleCardId[];
  tutorial: TutorialState;
  hasSeenMovesHint: boolean;
}

interface RulesState extends RulesProgress {
  markSeen: (ids: readonly RuleCardId[]) => void;
  finishTutorial: () => void;
  skipTutorial: () => void;
  markMovesHintSeen: () => void;
  reset: () => void;
}

const INITIAL: RulesProgress = { seenCards: [], tutorial: "pending", hasSeenMovesHint: false };

export const isRuleCardId = (id: string): id is RuleCardId => Object.hasOwn(RULE_DEMOS, id);

const progressSchema = z.object({
  seenCards: z.array(z.string()).transform((ids) => ids.filter(isRuleCardId)),
  tutorial: z.enum(["pending", "done", "skipped"]),
  hasSeenMovesHint: z.boolean(),
});

export const useRulesStore = create<RulesState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      markSeen: (ids) => set({ seenCards: [...new Set([...get().seenCards, ...ids])] }),
      finishTutorial: () => set({ tutorial: "done" }),
      skipTutorial: () => set({ tutorial: "skipped" }),
      markMovesHintSeen: () => set({ hasSeenMovesHint: true }),
      reset: () => set(INITIAL),
    }),
    {
      name: "rules",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ seenCards, tutorial, hasSeenMovesHint }): RulesProgress => ({
        seenCards,
        tutorial,
        hasSeenMovesHint,
      }),
      migrate: (persisted) => progressSchema.catch(INITIAL).parse(persisted),
    },
  ),
);

export const unseenCards = (ids: readonly RuleCardId[], seen: readonly RuleCardId[]) =>
  ids.filter((id) => !seen.includes(id));
