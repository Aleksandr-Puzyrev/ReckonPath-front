import { onlineManager } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import type { LevelInput } from "@reckon-path/engine";

import { useDailyRecordStore } from "@entities/daily";
import { useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { i18n } from "@shared/i18n";
import { attemptFixture } from "@shared/test-utils/attempt-fixture";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DailyResultSheet from "./daily-result-sheet";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

jest.mock("@entities/streak", () => ({
  ...jest.requireActual("@entities/streak"),
  useStreakQuery: () => ({ data: undefined }),
}));

const DAY = "2026-09-28";
const LEVEL: LevelInput = {
  v: 2,
  id: `d-${DAY}`,
  rows: 4,
  cols: 4,
  targets: [[3, 3]],
  probeMode: "distance",
  moveLimit: 12,
  stars: [4, 6],
};
const ATTEMPT = attemptFixture({ mode: "daily", ref: LEVEL.id, durationMs: 84_000 });

interface Place {
  rank: number | null;
  percentile: number | null;
  ranked: boolean | null;
}

const NOT_SENT: Place = { rank: null, percentile: null, ranked: null };

const countAttempt = (place: Place) => {
  useDailyRecordStore.getState().recordCounted(DAY, {
    attemptId: ATTEMPT.attemptId,
    result: "won",
    movesUsed: 1,
    stars: 3,
    durationMs: 84_000,
  });
  useDailyRecordStore.getState().recordPlace(ATTEMPT.attemptId, place);
};

const renderSheet = async () => {
  await render(
    <DailyResultSheet
      isOpen
      dayKey={DAY}
      attempt={ATTEMPT}
      onAgain={jest.fn()}
      onHome={jest.fn()}
    />,
    { wrapper: createQueryWrapper() },
  );
};

describe("DailyResultSheet", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    jest.useFakeTimers({ now: Date.UTC(2026, 8, 28, 12) });
    useDailyRecordStore.getState().reset();
    useOutboxStore.getState().reset();
    useGameSessionStore.getState().start(LEVEL, "new");
    useGameSessionStore.getState().tap(15);
  });

  afterEach(async () => {
    await act(async () => onlineManager.setOnline(true));
    jest.useRealTimers();
  });

  test("shows the moves and the time of the attempt", async () => {
    countAttempt(NOT_SENT);
    await renderSheet();

    expect(screen.getByText("1 / 12")).toBeOnTheScreen();
    expect(screen.getByText("1:24")).toBeOnTheScreen();
  });

  test("counts the place until the server answers", async () => {
    countAttempt(NOT_SENT);
    useOutboxStore.getState().enqueue(ATTEMPT);
    await renderSheet();

    expect(screen.getByText("Считаем…")).toBeOnTheScreen();
  });

  test("shows the server's place, the top share and the new streak day", async () => {
    countAttempt({ rank: 134, percentile: 88, ranked: true });
    await renderSheet();

    expect(screen.getByText(/^#134$/)).toBeOnTheScreen();
    expect(screen.getByText("Топ 12%")).toBeOnTheScreen();
    expect(screen.getByText("Серия 1 день · +1")).toBeOnTheScreen();
  });

  test("tells the result will be sent once online", async () => {
    onlineManager.setOnline(false);
    countAttempt(NOT_SENT);
    useOutboxStore.getState().enqueue(ATTEMPT);
    await renderSheet();

    expect(screen.getByText("Результат отправится, когда появится сеть")).toBeOnTheScreen();
  });

  test("marks a continued win left out of the standings (DLY-06)", async () => {
    countAttempt({ rank: null, percentile: null, ranked: false });
    await renderSheet();

    expect(screen.getByText("Продолжение — без места в лидерборде")).toBeOnTheScreen();
    expect(screen.queryByText("Считаем…")).toBeNull();
  });

  test("gives a replay no place and says it is not ranked (DLY-04)", async () => {
    useDailyRecordStore.getState().recordCounted(DAY, {
      attemptId: "counted-earlier",
      result: "lost",
      movesUsed: 4,
      stars: null,
      durationMs: 1,
    });
    useDailyRecordStore
      .getState()
      .recordPlace("counted-earlier", { rank: 500, percentile: 10, ranked: true });
    await renderSheet();

    expect(screen.queryByText(/^#500$/)).toBeNull();
    expect(screen.getByText("Переигровка — без награды и лидерборда")).toBeOnTheScreen();
  });
});
