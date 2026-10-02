import type { LevelInput } from "@reckon-path/engine";

import { replaySession } from "./replay-session";
import type { SessionAction } from "./replay-session";
import { attemptOf } from "./session-attempt";

const LEVEL: LevelInput = {
  v: 2,
  id: "c-attempt",
  rows: 3,
  cols: 3,
  targets: [[2, 2]],
  probeMode: "distance",
  moveLimit: 2,
  stars: [1, 2],
};

const STARTED_AT = Date.UTC(2026, 8, 26, 8, 1, 10);
const FINISHED_AT = Date.UTC(2026, 8, 26, 8, 3, 2);

const finishedWith = (actions: SessionAction[], startedAt: number | null = STARTED_AT) =>
  attemptOf({
    mode: "campaign",
    levelId: LEVEL.id,
    actions,
    startedAt,
    finishedAt: FINISHED_AT,
    game: replaySession(LEVEL, actions),
  });

describe("attemptOf", () => {
  test("describes a won campaign attempt with taps as [row, column]", () => {
    const attempt = finishedWith([
      { type: "tap", cell: 1 },
      { type: "tap", cell: 8 },
    ]);

    expect(attempt).toMatchObject({
      mode: "campaign",
      ref: "c-attempt",
      startedAt: "2026-09-26T08:01:10.000Z",
      finishedAt: "2026-09-26T08:03:02.000Z",
      taps: [
        [0, 1],
        [2, 2],
      ],
      continued: false,
      continueMethod: null,
      claimed: { result: "won", movesUsed: 2, stars: 2 },
    });
    expect(attempt.attemptId).toMatch(/^[0-9a-f-]{36}$/);
  });

  test("claims a loss without stars", () => {
    const attempt = finishedWith([
      { type: "tap", cell: 0 },
      { type: "tap", cell: 1 },
    ]);

    expect(attempt.claimed).toEqual({ result: "lost", movesUsed: 2, stars: null });
  });

  test("tells how the game was continued", () => {
    const attempt = finishedWith([
      { type: "tap", cell: 0 },
      { type: "tap", cell: 1 },
      { type: "continue", method: "ad" },
      { type: "tap", cell: 8 },
    ]);

    expect(attempt).toMatchObject({ continued: true, continueMethod: "ad" });
    expect(attempt.taps).toHaveLength(3);
  });

  test("leaves out an unknown start time", () => {
    expect(finishedWith([{ type: "tap", cell: 8 }], null)).not.toHaveProperty("startedAt");
  });

  test("gives every attempt its own id", () => {
    const actions: SessionAction[] = [{ type: "tap", cell: 8 }];

    expect(finishedWith(actions).attemptId).not.toBe(finishedWith(actions).attemptId);
  });

  test("reports the duration of a daily attempt only", () => {
    const actions: SessionAction[] = [{ type: "tap", cell: 8 }];
    const game = replaySession(LEVEL, actions);
    const daily = attemptOf({
      mode: "daily",
      levelId: "d-2026-09-26",
      actions,
      startedAt: STARTED_AT,
      finishedAt: FINISHED_AT,
      game,
    });

    expect(daily).toMatchObject({ mode: "daily", ref: "d-2026-09-26", durationMs: 112_000 });
    expect(finishedWith(actions)).not.toHaveProperty("durationMs");
  });
});
