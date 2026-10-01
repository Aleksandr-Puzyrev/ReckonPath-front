import type { LevelInput } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";
import { useProgressStore } from "@entities/progress";

import { tapCell, unlockTapInput } from "./tap-cell";

jest.mock("@shared/haptics", () => ({ haptic: jest.fn() }));

const LEVEL: LevelInput = {
  v: 2,
  id: "c-tap",
  rows: 4,
  cols: 4,
  targets: [
    [0, 0],
    [3, 3],
  ],
  probeMode: "distance",
  moveLimit: 6,
  stars: [3, 4],
};

describe("tapCell", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    unlockTapInput();
    useProgressStore.getState().reset();
    useGameSessionStore.getState().start(LEVEL, "new");
  });

  afterEach(() => jest.useRealTimers());

  test("ignores taps for 300 ms after a target is found", () => {
    tapCell(0);
    expect(tapCell(5).events).toEqual([]);
    jest.advanceTimersByTime(300);
    expect(tapCell(5).events).toHaveLength(1);
  });

  test("records the win in progress and forgets the session", () => {
    tapCell(0);
    jest.advanceTimersByTime(300);
    const outcome = tapCell(15);

    expect(outcome.events.map(({ type }) => type)).toEqual(["targetFound", "win"]);
    expect(useProgressStore.getState().best["c-tap"]).toEqual({ stars: 3, moves: 2 });
    expect(useGameSessionStore.getState().levelId).toBeNull();
    expect(useGameSessionStore.getState().game?.status).toBe("won");
  });
});
