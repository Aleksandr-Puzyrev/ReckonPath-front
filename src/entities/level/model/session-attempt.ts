import { uuidv7 } from "uuidv7";

import type { GameState } from "@reckon-path/engine";

import type { components } from "@shared/api";

import { levelStarsOf } from "./level-stars";
import type { SessionAction } from "./replay-session";

type Attempt = components["schemas"]["Attempt"];

interface FinishedSession {
  levelId: string;
  actions: readonly SessionAction[];
  startedAt: number | null;
  finishedAt: number;
  game: GameState;
}

const toIsoTime = (time: number) => new Date(time).toISOString();

export const attemptOf = ({
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
    mode: "campaign",
    ref: levelId,
    // TODO: send contentVersion once content comes from the server (GET /content/manifest)
    ...(startedAt === null ? {} : { startedAt: toIsoTime(startedAt) }),
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
