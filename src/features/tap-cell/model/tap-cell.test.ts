import type { LevelInput } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";

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
    useGameSessionStore.getState().start(LEVEL, "new");
  });

  afterEach(() => jest.useRealTimers());

  test("ignores taps for 300 ms after a target is found", () => {
    tapCell(0);
    expect(tapCell(5)).toEqual([]);
    jest.advanceTimersByTime(300);
    expect(tapCell(5)).toHaveLength(1);
  });

  test("applies the tap to the game in progress", () => {
    tapCell(0);
    jest.advanceTimersByTime(300);

    expect(tapCell(15).map(({ type }) => type)).toEqual(["targetFound", "win"]);
    expect(useGameSessionStore.getState().game?.status).toBe("won");
  });
});
