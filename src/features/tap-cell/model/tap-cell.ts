import type { GameEvent, Idx } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";
import { haptic } from "@shared/haptics";
import { motion } from "@shared/theme";

import { hapticsForEvents } from "./haptics-for-events";

let inputLockedUntil = 0;

export const tapCell = (cell: Idx): GameEvent[] => {
  if (Date.now() < inputLockedUntil) return [];

  const events = useGameSessionStore.getState().tap(cell);
  haptic(...hapticsForEvents(events));

  if (events.some(({ type }) => type === "targetFound")) {
    inputLockedUntil = Date.now() + motion.animation.targetInputLock;
  }

  return events;
};

export const unlockTapInput = () => {
  inputLockedUntil = 0;
};
