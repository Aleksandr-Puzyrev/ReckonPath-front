import { fireEvent, render, screen } from "@testing-library/react-native";

import type { LevelInput } from "@reckon-path/engine";

import { i18n } from "@shared/i18n";

import DailyTodayCard from "./daily-today-card";

const LEVEL: LevelInput = {
  v: 2,
  id: "d-2026-09-28",
  rows: 7,
  cols: 7,
  targets: [
    [1, 1],
    [5, 5],
  ],
  bombs: [[3, 3]],
  probeMode: "distance",
  moveLimit: 12,
  stars: [7, 9],
};

const RECORD = {
  attemptId: "a",
  result: "won" as const,
  movesUsed: 7,
  stars: 3,
  durationMs: 84_000,
  rank: 134,
  percentile: 88,
  ranked: true,
};

const renderCard = (props: Partial<Parameters<typeof DailyTodayCard>[0]> = {}) =>
  render(
    <DailyTodayCard
      level={LEVEL}
      preview={null}
      record={undefined}
      hasSavedGame={false}
      onPlay={jest.fn()}
      {...props}
    />,
  );

describe("DailyTodayCard", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("describes today's level and offers to play", async () => {
    const onPlay = jest.fn();
    await renderCard({ onPlay });

    expect(screen.getByText("7×7 · 2 цели")).toBeOnTheScreen();
    expect(screen.getByText("1 бомба")).toBeOnTheScreen();
    expect(screen.getByText("лимит 12 ходов · 3★ до 7")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Играть"));
    expect(onPlay).toHaveBeenCalled();
  });

  test("offers to continue a saved game", async () => {
    await renderCard({ hasSavedGame: true });

    expect(screen.getByText("Продолжить")).toBeOnTheScreen();
  });

  test("shows the counted result and a replay without reward", async () => {
    await renderCard({ record: RECORD });

    expect(screen.getByText("Сыграно: 7 ходов · #134")).toBeOnTheScreen();
    expect(screen.getByText("Сыграть ещё (без награды)")).toBeOnTheScreen();
  });
});
