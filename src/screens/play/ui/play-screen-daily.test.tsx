import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import type { LevelInput } from "@reckon-path/engine";

import { useCampaignFlagsStore } from "@entities/level";
import { RULE_DEMOS, isRuleCardId, useRulesStore } from "@entities/rules";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import {
  mockServer,
  mockUrl,
  passMockLevels,
  setMockDailyLevel,
} from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

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

const LEVEL: LevelInput = {
  v: 2,
  id: `d-${DAY}`,
  rows: 4,
  cols: 4,
  targets: [[3, 3]],
  probeMode: "distance",
  moveLimit: 4,
  stars: [2, 3],
};
const TARGET = 15;
const BOARD_LAYOUT = { nativeEvent: { layout: { width: 358, height: 358 } } };
const FLUSHES = 10;

const flushRequests = () => act(() => jest.advanceTimersByTimeAsync(1));

const flushUntil = async (isDone: () => boolean) => {
  for (let step = 0; step < FLUSHES && !isDone(); step += 1) await flushRequests();
};

const tap = async (...cells: number[]) => {
  for (const cell of cells) {
    await fireEvent.press(screen.getByTestId(`cell-${cell}`));
    await flushRequests();
    await act(async () => jest.advanceTimersByTime(300));
  }
};

const settle = () => act(async () => jest.advanceTimersByTime(1000));

const renderScreen = async () => {
  await render(<PlayScreen />, { wrapper: createQueryWrapper() });
  await flushUntil(() => screen.queryByTestId("board-area") !== null);
  const area = screen.queryByTestId("board-area");
  if (area !== null) await fireEvent(area, "layout", BOARD_LAYOUT);
};

const recordTaps = () => {
  const bodies: unknown[] = [];
  mockServer.use(
    http.post(mockUrl("/daily/games/:id/tap"), async ({ request }) => {
      bodies.push(await request.clone().json());
    }),
  );
  return bodies;
};

describe("PlayScreen in the daily", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    jest.useFakeTimers({ now: Date.UTC(2026, 8, 28, 12) });
    mockParams.id = `d-${DAY}`;
    mockRouter.replace.mockClear();
    passMockLevels(6);
    setMockDailyLevel(LEVEL);
    useCampaignFlagsStore.getState().reset();
    useRulesStore.getState().reset();
    useRulesStore.getState().markSeen(Object.keys(RULE_DEMOS).filter(isRuleCardId));
    useRulesStore.getState().skipTutorial();
  });

  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("starts today's game on the server and shows its board with the attempt", async () => {
    await renderScreen();

    expect(screen.getByText("Пеленг дня")).toBeOnTheScreen();
    expect(screen.getByText("28 сентября")).toBeOnTheScreen();
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
    expect(screen.getByText("Попытка 1 — чем меньше попыток, тем выше место")).toBeOnTheScreen();
  });

  test("taps on the server with the count of taps made (decision 0061 #1)", async () => {
    const bodies = recordTaps();
    await renderScreen();

    await tap(0, 1);

    expect(bodies).toEqual([
      { row: 0, col: 0, seq: 0 },
      { row: 0, col: 1, seq: 1 },
    ]);
    expect(screen.getByText("2 / 4")).toBeOnTheScreen();
  });

  test("takes the server's game when a tap is stale", async () => {
    await renderScreen();
    const daily = await apiClient.GET("/daily");
    await apiClient.POST("/daily/games/{id}/tap", {
      params: { path: { id: daily.data?.day.gameId ?? "" } },
      body: { row: 0, col: 0, seq: 0 },
    });

    await tap(1);

    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
    expect(screen.getByText(/^A1 → 6/)).toBeOnTheScreen();
  });

  test("shows the win another device finished when the tap gets game_over", async () => {
    await renderScreen();
    const daily = await apiClient.GET("/daily");
    await apiClient.POST("/daily/games/{id}/tap", {
      params: { path: { id: daily.data?.day.gameId ?? "" } },
      body: { row: 3, col: 3, seq: 0 },
    });

    await tap(0);
    await flushUntil(() => screen.queryByText("Пеленг дня пройден") !== null);

    expect(screen.getByText("Пеленг дня пройден")).toBeOnTheScreen();
  });

  test("retries a failed restart as a restart, not as the old attempt", async () => {
    const plays: unknown[] = [];
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    mockServer.use(
      http.post(mockUrl("/daily/play"), async ({ request }) => {
        plays.push(await request.clone().json());
      }),
      http.post(mockUrl("/daily/play"), () => HttpResponse.error(), { once: true }),
    );

    await fireEvent.press(screen.getByText("Начать заново"));
    await flushUntil(() => screen.queryByText("Повторить") !== null);
    await fireEvent.press(screen.getByText("Повторить"));
    await flushUntil(() => screen.queryByTestId("board-area") !== null);

    expect(plays).toEqual([{ restart: true }, { restart: true }]);
    expect(screen.getByText("Попытка 2 — чем меньше попыток, тем выше место")).toBeOnTheScreen();
  });

  test("waits with a retry when the network drops during a tap", async () => {
    mockServer.use(
      http.post(mockUrl("/daily/games/:id/tap"), () => HttpResponse.error(), { once: true }),
    );
    await renderScreen();
    await tap(0);

    expect(screen.getByText("Нет связи с сервером")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Повторить"));
    await flushRequests();

    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
  });

  test("starts a new attempt with restart after a loss, without a continue (decision 0061 #1)", async () => {
    const plays: unknown[] = [];
    mockServer.use(
      http.post(mockUrl("/daily/play"), async ({ request }) => {
        plays.push(await request.clone().json());
      }),
    );
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();

    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
    expect(screen.queryByTestId("continue-emeralds")).toBeNull();
    await fireEvent.press(screen.getByText("Начать заново"));
    await flushUntil(
      () => screen.queryByText("Попытка 2 — чем меньше попыток, тем выше место") !== null,
    );

    expect(plays.at(-1)).toEqual({ restart: true });
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
  });

  test("shows the result with the server's rewards and the place, without a replay", async () => {
    await renderScreen();
    await tap(TARGET);
    await settle();
    await flushRequests();

    expect(screen.getByText("Пеленг дня пройден")).toBeOnTheScreen();
    expect(screen.getByText("+60")).toBeOnTheScreen();
    expect(screen.getByText("+15 XP")).toBeOnTheScreen();
    expect(screen.getByText("Место 1 из 9")).toBeOnTheScreen();
    expect(screen.queryByText(/Ещё раз/)).toBeNull();
  });

  test("shows the won result when the day is already done", async () => {
    await renderScreen();
    await tap(TARGET);
    await renderScreen();

    expect(screen.getByText("Пеленг дня пройден")).toBeOnTheScreen();
  });

  test("ends another day's daily with a way to today's (decision 0061 #11)", async () => {
    mockParams.id = "d-2026-09-27";
    await renderScreen();

    expect(screen.getByText("День закончился — начни сегодняшний пеленг")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Играть"));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "daily", id: `d-${DAY}` },
    });
  });

  test("ends the game when the day changes during it", async () => {
    await renderScreen();
    await tap(0);

    await act(async () => jest.advanceTimersByTime(12 * 3_600_000));

    expect(screen.getByText("День закончился — начни сегодняшний пеленг")).toBeOnTheScreen();
  });

  test("tells that today's level is not ready yet", async () => {
    mockServer.use(
      http.post(mockUrl("/daily/play"), () =>
        HttpResponse.json({ error: { code: "daily_unavailable" } }, { status: 404 }),
      ),
    );
    await renderScreen();

    expect(screen.getByText("Уровень дня ещё не готов — загляни позже")).toBeOnTheScreen();
  });

  test("asks for the network when the game cannot be opened", async () => {
    mockServer.use(http.post(mockUrl("/daily/play"), () => HttpResponse.error()));
    await renderScreen();

    expect(screen.getByText("Нужна сеть, чтобы играть пеленг дня")).toBeOnTheScreen();
  });

  test("does not open an id that is not a day", async () => {
    mockParams.id = "d-yesterday";
    await renderScreen();

    expect(screen.getByText("Уровень не найден")).toBeOnTheScreen();
  });
});
