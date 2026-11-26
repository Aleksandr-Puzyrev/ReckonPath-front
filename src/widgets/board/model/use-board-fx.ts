import { useRef } from "react";
import {
  ReduceMotion,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import type { GameEvent, Idx } from "@reckon-path/engine";

import type { EffectSlot } from "@entities/item";

type EffectListener = (cell: Idx, effects: readonly EffectSlot[]) => void;

const POP_FROM = 0.4;
const NO_CELL = -1;
const ANSWER_EVENTS: ReadonlySet<GameEvent["type"]> = new Set([
  "reveal",
  "buoy",
  "targetFound",
  "bomb",
]);
const BLOCKED_EVENTS: ReadonlySet<GameEvent["type"]> = new Set(["blocked", "alreadyRevealed"]);

export const useBoardFx = () => {
  const listener = useRef<EffectListener | null>(null);
  const subscribeEffects = (next: EffectListener) => {
    listener.current = next;
    return () => {
      if (listener.current === next) listener.current = null;
    };
  };
  const tap = (cell: Idx) => listener.current?.(cell, ["fxClick"]);
  const { theme } = useUnistyles();
  const { animation, shake, spring } = theme.motion;
  const isReducedMotion = useReducedMotion();
  const popCell = useSharedValue(NO_CELL);
  const pop = useSharedValue(1);
  const shakeCell = useSharedValue(NO_CELL);
  const cellShake = useSharedValue(0);
  const boardShake = useSharedValue(0);
  const pressedCell = useSharedValue(NO_CELL);

  const oscillate = (distance: number, count: number, total: number) => {
    const step = total / (count * 2);
    return withSequence(
      withRepeat(
        withSequence(
          withTiming(distance, { duration: step }),
          withTiming(-distance, { duration: step }),
        ),
        count,
      ),
      withTiming(0, { duration: step, reduceMotion: ReduceMotion.System }),
    );
  };

  const play = (cell: Idx, events: readonly GameEvent[]) => {
    if (listener.current !== null && events.some(({ type }) => type === "targetFound")) {
      const effects: EffectSlot[] = ["fxReveal"];
      if (events.some(({ type }) => type === "win")) effects.push("fxVictory");
      listener.current(cell, effects);
    }
    if (events.some(({ type }) => ANSWER_EVENTS.has(type))) {
      popCell.set(cell);
      pop.set(isReducedMotion ? 1 : POP_FROM);
      pop.set(withSpring(1, spring.bouncy));
    }
    if (isReducedMotion) return;
    if (events.some(({ type }) => type === "bomb")) {
      boardShake.set(oscillate(shake.bomb.distance, shake.bomb.count, animation.bomb));
    }
    if (events.some(({ type }) => BLOCKED_EVENTS.has(type))) {
      shakeCell.set(cell);
      cellShake.set(oscillate(shake.blocked.distance, shake.blocked.count, animation.blockedShake));
    }
  };

  return {
    popCell,
    pop,
    shakeCell,
    cellShake,
    boardShake,
    pressedCell,
    play,
    tap,
    subscribeEffects,
  };
};

export type BoardFx = ReturnType<typeof useBoardFx>;
