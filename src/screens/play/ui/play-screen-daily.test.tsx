import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import type { LevelInput } from "@reckon-path/engine";

import { dailyDayQueryOptions, useDailyRecordStore } from "@entities/daily";
import { CAMPAIGN_LEVELS, useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { RULE_DEMOS, isRuleCardId, useRulesStore } from "@entities/rules";
import { unlockTapInput } from "@features/tap-cell";
import { i18n } from "@shared/i18n";

import PlayScreen from "./play-screen";

const DAY = "2026-09-28";
const mockParams = { mode: "daily", id: `d-${DAY}` };
const mockRouter = { back: jest.fn(), replace: jest.fn(), canGoBack: () => true };

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockParams,
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/haptics", () => ({ haptic: jest.fn() }));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => jest.requireActual("../test-utils/fake-board"));

const OVERRIDE: Omit<LevelInput, "id"> = {
  v: 2,
  rows: 4,
  cols: 4,
  targets: [[3, 3]],
  probeMode: "distance",
  moveLimit: 6,
  stars: [2, 3],
};
const TARGET = 15;
const BOARD_LAYOUT = { nativeEvent: { layout: { width: 358, height: 358 } } };

const renderPlay = async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
  });
  queryClient.setQueryData(dailyDayQueryOptions(DAY).queryKey, {
    date: DAY,
    override: OVERRIDE,
    leaderboardPreview: { top: [], median: 9 },
    me: { played: false },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  await render(<PlayScreen />, { wrapper });
};

const renderDaily = async () => {
  await renderPlay();
  await fireEvent(screen.getByTestId("board-area"), "layout", BOARD_LAYOUT);
};

const tap = async (...cells: number[]) => {
  for (const cell of cells) {
    await fireEvent.press(screen.getByTestId(`cell-${cell}`));
    await act(async () => jest.advanceTimersByTime(300));
  }
};

const settle = () => act(async () => jest.advanceTimersByTime(1000));

describe("PlayScreen in the daily", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    jest.useFakeTimers({ now: Date.UTC(2026, 8, 28, 12) });
    mockParams.id = `d-${DAY}`;
    unlockTapInput();
    useGameSessionStore.getState().reset();
    useOutboxStore.getState().reset();
    useDailyRecordStore.getState().reset();
    useProgressStore
      .getState()
      .replaceBest(
        Object.fromEntries(
          CAMPAIGN_LEVELS.slice(0, 6).map(({ level }) => [level.id, { stars: 3, moves: 5 }]),
        ),
      );
    useRulesStore.getState().reset();
    useRulesStore.getState().markSeen(Object.keys(RULE_DEMOS).filter(isRuleCardId));
    useRulesStore.getState().skipTutorial();
  });

  afterEach(() => jest.useRealTimers());

  test("titles the game with the day and notes the timer in the pause", async () => {
    await renderDaily();

    expect(screen.getByText("Пеленг дня")).toBeOnTheScreen();
    expect(screen.getByText("28 сентября")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("pause"));
    expect(screen.getByText("таймер идёт — время влияет на место")).toBeOnTheScreen();
  });

  test("warns that restarting counts the attempt as a loss, then sends it (DLY-05)", async () => {
    await renderDaily();
    await tap(0);

    await fireEvent.press(screen.getByTestId("restart"));
    expect(
      screen.getByText(
        "Зачётная попытка будет засчитана как поражение. Переигровка — без награды и лидерборда.",
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Заново"));

    expect(useOutboxStore.getState().attempts).toMatchObject([
      { mode: "daily", ref: `d-${DAY}`, claimed: { result: "lost", movesUsed: 1 } },
    ]);
    expect(useDailyRecordStore.getState().days[DAY]?.result).toBe("lost");
  });

  test("shows the daily result after a win and keeps the campaign untouched", async () => {
    await renderDaily();
    await tap(TARGET);
    await settle();

    expect(screen.getByText("Пеленг дня пройден")).toBeOnTheScreen();
    expect(useOutboxStore.getState().attempts[0]).toMatchObject({ mode: "daily", durationMs: 0 });
    expect(Object.keys(useProgressStore.getState().best)).toHaveLength(6);
  });

  test("restarts a replay without the warning", async () => {
    useDailyRecordStore.getState().recordCounted(DAY, {
      attemptId: "counted",
      result: "won",
      movesUsed: 1,
      stars: 3,
      durationMs: 1,
    });
    await renderDaily();
    await tap(0);

    await fireEvent.press(screen.getByTestId("restart"));

    expect(screen.getByText("Начать заново? Ходы сбросятся")).toBeOnTheScreen();
  });

  test("does not open another day's daily", async () => {
    mockParams.id = "d-2026-09-20";

    await renderPlay();

    expect(screen.getByText("Уровень не найден")).toBeOnTheScreen();
  });
});
