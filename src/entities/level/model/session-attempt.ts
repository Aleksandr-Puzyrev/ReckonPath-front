import { uuidv7 } from "uuidv7";

import type { GameState } from "@reckon-path/engine";

import type { components } from "@shared/api";

import { levelStarsOf } from "./level-stars";
import type { SessionAction } from "./replay-session";

type Attempt = components["schemas"]["Attempt"];
type AttemptMode = Attempt["mode"];

interface FinishedSession {
  mode: AttemptMode;
  levelId: string;
  actions: readonly SessionAction[];
  startedAt: number | null;
  finishedAt: number;
  game: GameState;
}

const toIsoTime = (time: number) => new Date(time).toISOString();

export const attemptOf = ({
  mode,
  levelId,
  actions,
  startedAt,
  finishedAt,
  game,
}: FinishedSession): Attempt => {
  const { cols } = game.board;
  const isWon = game.status === "won";
  const continueAction = actions.find((action) => action.type === "continue");
  return {
    attemptId: uuidv7(),
    mode,
    ref: levelId,
    // TODO: send contentVersion once content comes from the server (GET /content/manifest)
    ...(startedAt === null ? {} : { startedAt: toIsoTime(startedAt) }),
    // Only the daily ranks by time, so only it reports the duration (по времени ранжируется только дейли, поэтому только она сообщает длительность).
    ...(mode === "daily" && startedAt !== null ? { durationMs: finishedAt - startedAt } : {}),
    finishedAt: toIsoTime(finishedAt),
    taps: actions.flatMap((action) =>
      action.type === "tap" ? [[Math.floor(action.cell / cols), action.cell % cols]] : [],
    ),
    continued: continueAction !== undefined,
    continueMethod: continueAction?.method ?? null,
    claimed: {
      result: isWon ? "won" : "lost",
      movesUsed: game.movesUsed,
      stars: isWon ? levelStarsOf(game) : null,
    },
  };
};
