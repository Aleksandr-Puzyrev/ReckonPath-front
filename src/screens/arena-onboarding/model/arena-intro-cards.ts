import type { RuleCardId } from "@entities/rules";

export const ARENA_INTRO_CARDS = ["turns", "bomb", "first"] as const;

export type ArenaIntroCard = (typeof ARENA_INTRO_CARDS)[number];

export const ARENA_ELEMENT_CARDS: readonly RuleCardId[] = [
  "fence",
  "stream",
  "bridge",
  "heavy",
  "rock",
  "bomb",
];
