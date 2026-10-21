import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { offerLinkAfterLevel } from "@features/link-account";
import { useInterstitialStore } from "@entities/ad";
import { useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { RULE_DEMOS, isRuleCardId, useRulesStore } from "@entities/rules";
import { unlockTapInput } from "@features/tap-cell";
import { i18n } from "@shared/i18n";
import { adsProvider } from "@shared/ads";
import { bootstrapMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import PlayScreen from "./play-screen";

const mockParams: { mode: string; id: string; resume?: string } = { mode: "campaign", id: "c-a" };
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
jest.mock("@reckon-path/content", () => ({
  ...jest.requireActual("@reckon-path/content"),
  ...jest.requireActual("../test-utils/test-levels"),
}));
jest.mock("@widgets/board", () => jest.requireActual("../test-utils/fake-board"));
jest.mock("@features/link-account", () => ({ offerLinkAfterLevel: jest.fn() }));

const BOMB = 3;
const TARGET = 15;

const tap = async (...cells: number[]) => {
  for (const cell of cells) {
    await fireEvent.press(screen.getByTestId(`cell-${cell}`));
    await act(async () => jest.advanceTimersByTime(300));
  }
};

const BOARD_LAYOUT = { nativeEvent: { layout: { width: 358, height: 358 } } };

const renderScreen = async () => {
  const view = await render(<PlayScreen />, { wrapper: createQueryWrapper() });
  const area = screen.queryByTestId("board-area");
  if (area !== null) await fireEvent(area, "layout", BOARD_LAYOUT);
  return view;
};

const settle = () => act(async () => jest.advanceTimersByTime(1000));

const flushRequests = () => act(() => jest.advanceTimersByTimeAsync(0));

const continueForEmeralds = async () => {
  await flushRequests();
  await fireEvent.press(screen.getByTestId("continue-emeralds"));
  await flushRequests();
};

describe("PlayScreen", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("ru");
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockParams.mode = "campaign";
    mockParams.id = "c-a";
    mockParams.resume = undefined;
    mockRouter.replace.mockClear();
    unlockTapInput();
    useGameSessionStore.getState().reset();
    useProgressStore.getState().reset();
    useOutboxStore.getState().reset();
    useRulesStore.getState().reset();
    useRulesStore.getState().markSeen(Object.keys(RULE_DEMOS).filter(isRuleCardId));
    useRulesStore.getState().skipTutorial();
  });

  afterEach(() => {
    mockServer.reset();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("shows an error state for an unknown level", async () => {
    mockParams.id = "c-missing";
    await renderScreen();
    expect(screen.getByText("Уровень не найден")).toBeOnTheScreen();
  });

  test("does not open a locked level reached by a link", async () => {
    mockParams.id = "c-b";
    await renderScreen();
    expect(screen.getByText("Сначала пройди уровень 1")).toBeOnTheScreen();
    expect(useGameSessionStore.getState().game).toBeNull();
  });

  test("shows an error state for a mode other than the campaign", async () => {
    mockParams.mode = "daily";
    await renderScreen();
    expect(screen.getByText("Уровень не найден")).toBeOnTheScreen();
  });

  test("spends a move and shows the bearing of a tapped cell (LVL-01)", async () => {
    await renderScreen();
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
    await tap(0);
    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
    expect(screen.getByText(/^A1 → 6/)).toBeOnTheScreen();
  });

  test("spends nothing on an opened cell (LVL-02)", async () => {
    await renderScreen();
    await tap(0, 0);
    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
  });

  test("costs two moves for a bomb and counts only unexploded bombs (LVL-08)", async () => {
    await renderScreen();
    await tap(BOMB);
    expect(screen.getByText("2 / 4")).toBeOnTheScreen();
    expect(screen.getByText("× 0")).toBeOnTheScreen();
    expect(screen.getByText("D1 · бомба!")).toBeOnTheScreen();
  });

  test("shows the lose sheet after the explosion when the last move is a bomb (LVL-09)", async () => {
    await renderScreen();
    await tap(0, 1, BOMB);
    expect(screen.getByText("0 / 4")).toBeOnTheScreen();
    await settle();
    expect(screen.getByText("Последний ход — бомба")).toBeOnTheScreen();
    expect(screen.getByText("Найдено 0 из 1")).toBeOnTheScreen();
  });

  test("shows the lose sheet when the moves run out", async () => {
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
  });

  test("continues once with three moves, then offers only a restart (LVL-13, LVL-15)", async () => {
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await continueForEmeralds();
    expect(screen.getByText("3 / 7")).toBeOnTheScreen();

    await tap(5, 6, 7);
    await settle();
    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
    expect(screen.queryByTestId("continue-emeralds")).toBeNull();
    expect(screen.getByText("Начать заново")).toBeOnTheScreen();
  });

  test("continues for an ad with three moves (LVL-13)", async () => {
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await flushRequests();

    await fireEvent.press(screen.getByTestId("continue-ad"));
    await act(() => jest.advanceTimersByTimeAsync(2000));

    expect(screen.getByText("3 / 7")).toBeOnTheScreen();
  });

  test("keeps the lose sheet when the ad is closed early (LVL-14)", async () => {
    jest.spyOn(adsProvider, "showRewarded").mockResolvedValue({ rewarded: false });
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await flushRequests();

    await fireEvent.press(screen.getByTestId("continue-ad"));
    await act(() => jest.advanceTimersByTimeAsync(200));

    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
    expect(screen.getByText("Реклама сейчас недоступна")).toBeOnTheScreen();
  });

  test("hides the ad continue after today's limit, keeping the ◆ one (LVL-16)", async () => {
    mockServer.use(
      http.get(mockUrl("/ads/limits"), () =>
        HttpResponse.json({
          gems: { used: 0, max: 5, resetAt: "2026-10-11T00:00:00Z" },
          continue: { used: 2, max: 2, resetAt: "2026-10-11T00:00:00Z" },
          streak: { used: 0, max: 1, resetAt: "2026-10-11T00:00:00Z" },
        }),
      ),
    );
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await flushRequests();

    expect(screen.queryByTestId("continue-ad")).toBeNull();
    expect(screen.getByTestId("continue-emeralds")).toBeOnTheScreen();
  });

  test("shows the targets and bombs after declining to continue", async () => {
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await fireEvent.press(screen.getByText("Не продолжать"));
    expect(screen.getByTestId("hidden-shown")).toBeOnTheScreen();
  });

  test("wins with stars and moves to the next level (LVL-11, LVL-12)", async () => {
    await renderScreen();
    await tap(TARGET);
    await settle();
    expect(screen.getByText("Уровень 1 пройден")).toBeOnTheScreen();
    expect(screen.getByLabelText("Звёзды: 3 из 3")).toBeOnTheScreen();
    expect(screen.getByText("1 из 4 · лучший: 1")).toBeOnTheScreen();
    expect(useProgressStore.getState().best["c-a"]).toEqual({ stars: 3, moves: 1 });

    await fireEvent.press(screen.getByText("Дальше"));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "c-b" },
    });
  });

  test("counts a finished campaign level when its result sheet closes", async () => {
    useInterstitialStore.getState().reset();
    await renderScreen();
    await tap(TARGET);
    await settle();

    await act(async () => fireEvent.press(screen.getByText("Дальше")));

    expect(useInterstitialStore.getState().finishedLevels).toBe(1);
  });

  test("shows an interstitial before restarting when its turn has come (ADS-06)", async () => {
    mockServer.use(
      http.get(mockUrl("/bootstrap"), () =>
        HttpResponse.json({ ...bootstrapMock(), config: { "ads.interstitial.minLevel": 1 } }),
      ),
    );
    useInterstitialStore.getState().reset();
    useInterstitialStore.getState().markLaunched(Date.now() - 3_600_000);
    useInterstitialStore.getState().countFinishedLevel();
    useInterstitialStore.getState().countFinishedLevel();
    const show = jest.spyOn(adsProvider, "showInterstitial");
    await renderScreen();
    await flushRequests();
    await tap(TARGET);
    await settle();

    await act(async () => fireEvent.press(screen.getByText("Ещё раз")));

    expect(show).toHaveBeenCalled();
    expect(useInterstitialStore.getState().finishedLevels).toBe(0);
  });

  test("offers linking for the level once its win sheet closes", async () => {
    jest.mocked(offerLinkAfterLevel).mockClear();
    await renderScreen();
    await tap(TARGET);
    await settle();
    expect(offerLinkAfterLevel).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText("Дальше"));

    expect(offerLinkAfterLevel).toHaveBeenCalledWith(1);
  });

  test("gives at most one star after a continue (LVL-13)", async () => {
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await continueForEmeralds();
    await tap(TARGET);
    await settle();
    expect(screen.getByLabelText("Звёзды: 1 из 3")).toBeOnTheScreen();
  });

  test("places a flag by long press or in flag mode without spending a move (LVL-20)", async () => {
    await renderScreen();
    await fireEvent(screen.getByTestId("cell-5"), "longPress");
    expect(useGameSessionStore.getState().flags).toEqual([5]);

    await fireEvent.press(screen.getByTestId("flag-mode"));
    await tap(6);
    expect(useGameSessionStore.getState().flags).toEqual([5, 6]);
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
  });

  test("asks before restarting a started game", async () => {
    await renderScreen();
    await tap(0);
    await fireEvent.press(screen.getByTestId("restart"));
    await fireEvent.press(screen.getByText("Заново"));
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
  });

  test("sends nothing when a game in progress is restarted", async () => {
    await renderScreen();
    await tap(0);
    await fireEvent.press(screen.getByTestId("restart"));
    await fireEvent.press(screen.getByText("Заново"));
    expect(useOutboxStore.getState().attempts).toEqual([]);
  });

  test("restarts an untouched game without asking", async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId("restart"));
    expect(screen.queryByText("Начать заново? Ходы сбросятся")).toBeNull();
  });

  test("offers to continue a saved game and restores it exactly (LVL-19)", async () => {
    const first = await renderScreen();
    await tap(0);
    await fireEvent(screen.getByTestId("cell-5"), "longPress");
    await first.unmount();
    useGameSessionStore.setState({ game: null });

    await renderScreen();
    expect(screen.getByText("Продолжить или начать заново?")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Продолжить"));
    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
    expect(useGameSessionStore.getState().flags).toEqual([5]);
  });

  test("resumes a saved game without asking when Home already chose «Продолжить» (decision 0041 #3)", async () => {
    const first = await renderScreen();
    await tap(0);
    await first.unmount();
    useGameSessionStore.setState({ game: null });
    mockParams.resume = "1";

    await renderScreen();

    expect(screen.queryByText("Продолжить или начать заново?")).toBeNull();
    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
  });

  test("ends a lost attempt when leaving, so it is not offered again", async () => {
    const first = await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await fireEvent.press(screen.getByText("К уровням"));
    expect(useGameSessionStore.getState().levelId).toBeNull();
    expect(useOutboxStore.getState().attempts).toMatchObject([
      { ref: "c-a", claimed: { result: "lost", movesUsed: 4, stars: null } },
    ]);
    await first.unmount();

    await renderScreen();
    expect(screen.queryByText("Продолжить или начать заново?")).toBeNull();
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
  });

  test("sends the lost attempt when the lost game is restarted", async () => {
    await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await fireEvent.press(screen.getByText("Начать заново"));
    expect(useOutboxStore.getState().attempts).toMatchObject([{ claimed: { result: "lost" } }]);
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
  });

  test("sends a lost attempt left on the lose sheet when another level is opened", async () => {
    const first = await renderScreen();
    await tap(0, 1, 2, 4);
    await settle();
    await first.unmount();
    useProgressStore.getState().recordWin("c-a", { stars: 3, moves: 2 });
    mockParams.id = "c-b";

    await renderScreen();

    expect(useOutboxStore.getState().attempts).toMatchObject([
      { ref: "c-a", claimed: { result: "lost" } },
    ]);
  });

  test("dates a lost attempt by the loss, not by leaving the sheet", async () => {
    const first = await renderScreen();
    await tap(0, 1, 2, 4);
    const lostAt = useGameSessionStore.getState().finishedAt;
    await settle();
    await act(async () => jest.advanceTimersByTime(60_000));
    await fireEvent.press(screen.getByText("К уровням"));
    await first.unmount();

    expect(useOutboxStore.getState().attempts[0]?.finishedAt).toBe(
      new Date(lostAt ?? 0).toISOString(),
    );
  });

  test("keeps a game in progress when leaving from the pause menu", async () => {
    await renderScreen();
    await tap(0);
    await fireEvent.press(screen.getByTestId("pause"));
    await fireEvent.press(screen.getByText("К уровням"));
    expect(useGameSessionStore.getState().actions).toHaveLength(1);
  });

  test("opens and closes the pause menu", async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId("pause"));
    expect(screen.getByText("Пауза · партия сохранится")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Продолжить"));
    expect(screen.queryByText("Пауза · партия сохранится")).toBeNull();
  });
});
