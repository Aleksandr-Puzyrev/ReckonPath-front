import type { LevelInput } from "@reckon-path/engine";

import { useDailyRecordStore } from "@entities/daily";
import { useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";

import { finishAttempt, isCountedDailyLevel } from "./finish-attempt";

const BOARD = {
  v: 2,
  rows: 4,
  cols: 4,
  targets: [
    [0, 0],
    [3, 3],
  ],
  probeMode: "distance",
  moveLimit: 6,
  stars: [3, 4],
} satisfies Omit<LevelInput, "id">;

const CAMPAIGN: LevelInput = { ...BOARD, id: "c-finish" };
const DAILY: LevelInput = { ...BOARD, id: "d-2026-09-26" };

const session = () => useGameSessionStore.getState();

const win = (level: LevelInput) => {
  session().start(level, "new");
  session().tap(0);
  session().tap(15);
};

beforeEach(() => {
  session().reset();
  useOutboxStore.getState().reset();
  useProgressStore.getState().reset();
  useDailyRecordStore.getState().reset();
});

describe("finishAttempt", () => {
  test("records a campaign win, queues it and forgets the session", () => {
    win(CAMPAIGN);

    const { attempt, isRecord } = finishAttempt();

    expect(isRecord).toBe(false);
    expect(attempt).toMatchObject({
      mode: "campaign",
      ref: "c-finish",
      claimed: { result: "won" },
    });
    expect(useProgressStore.getState().best["c-finish"]).toEqual({ stars: 3, moves: 2 });
    expect(useOutboxStore.getState().attempts).toHaveLength(1);
    expect(session().levelId).toBeNull();
  });

  test("tells a better result of a passed level is a record", () => {
    win(CAMPAIGN);
    finishAttempt();
    useProgressStore.getState().replaceBest({ "c-finish": { stars: 1, moves: 5 } });
    win(CAMPAIGN);

    expect(finishAttempt().isRecord).toBe(true);
  });

  test("counts the first daily attempt of the day and not the campaign progress", () => {
    win(DAILY);

    const { attempt } = finishAttempt();

    expect(attempt).toMatchObject({ mode: "daily", ref: "d-2026-09-26" });
    expect(useDailyRecordStore.getState().days["2026-09-26"]).toMatchObject({
      attemptId: attempt?.attemptId,
      result: "won",
      movesUsed: 2,
    });
    expect(useProgressStore.getState().best).toEqual({});
  });

  test("keeps the first daily attempt as the counted one after a replay (DLY-04)", () => {
    win(DAILY);
    const counted = finishAttempt().attempt;
    win(DAILY);

    finishAttempt();

    expect(useDailyRecordStore.getState().days["2026-09-26"]?.attemptId).toBe(counted?.attemptId);
    expect(useOutboxStore.getState().attempts).toHaveLength(2);
  });

  test("counts a daily game still in play as lost (DLY-05)", () => {
    session().start(DAILY, "new");
    session().tap(1);

    finishAttempt();

    expect(useOutboxStore.getState().attempts[0]?.claimed).toMatchObject({ result: "lost" });
    expect(isCountedDailyLevel(DAILY.id)).toBe(false);
  });

  test("does nothing without a game", () => {
    expect(finishAttempt()).toEqual({ attempt: null, isRecord: false });
  });
});

describe("isCountedDailyLevel", () => {
  test("is true for a daily without a counted attempt yet", () => {
    expect(isCountedDailyLevel(DAILY.id)).toBe(true);
    expect(isCountedDailyLevel(CAMPAIGN.id)).toBe(false);
  });
});
