import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { offerLinkAfterLevel } from "@features/link-account";
import { useInterstitialStore } from "@entities/ad";
import { useCampaignFlagsStore } from "@entities/level";
import { RULE_DEMOS, isRuleCardId, useRulesStore } from "@entities/rules";
import { apiClient } from "@shared/api";
import { adsProvider } from "@shared/ads";
import { i18n } from "@shared/i18n";
import { bootstrapMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import PlayScreen from "./play-screen";

const mockParams: { mode: string; id: string; resume?: string } = { mode: "campaign", id: "1" };
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

const renderScreen = async () => {
  const view = await render(<PlayScreen />, { wrapper: createQueryWrapper() });
  await flushUntil(() => screen.queryByTestId("campaign-loading") === null);
  const area = screen.queryByTestId("board-area");
  if (area !== null) await fireEvent(area, "layout", BOARD_LAYOUT);
  return view;
};

const settle = () => act(async () => jest.advanceTimersByTime(1000));

const loseByMoves = async () => {
  await tap(0, 1, 2, 4);
  await settle();
};

const continueForEmeralds = async () => {
  await flushRequests();
  await fireEvent.press(screen.getByTestId("continue-emeralds"));
  await flushRequests();
  await flushRequests();
};

describe("PlayScreen in the campaign", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("ru");
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockParams.mode = "campaign";
    mockParams.id = "1";
    mockParams.resume = undefined;
    mockRouter.replace.mockClear();
    mockRouter.back.mockClear();
    useCampaignFlagsStore.getState().reset();
    useRulesStore.getState().reset();
    useRulesStore.getState().markSeen(Object.keys(RULE_DEMOS).filter(isRuleCardId));
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markMovesHintSeen();
  });

  afterEach(() => {
    useAccountStore.getState().reset();
    mockServer.reset();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("shows an error state for a level the server does not have", async () => {
    mockParams.id = "99";
    await renderScreen();
    expect(screen.getByText("Уровень не найден")).toBeOnTheScreen();
  });

  test("does not open a level the server keeps locked", async () => {
    mockParams.id = "2";
    await renderScreen();
    expect(screen.getByText("Сначала пройди уровень 1")).toBeOnTheScreen();
  });

  test("shows an error state for an unknown mode", async () => {
    mockParams.mode = "event";
    await renderScreen();
    expect(screen.getByText("Уровень не найден")).toBeOnTheScreen();
  });

  test("asks for the network when the game cannot be opened (decision 0060 #3)", async () => {
    mockServer.use(http.post(mockUrl("/campaign/levels/:number/play"), () => HttpResponse.error()));
    await renderScreen();

    expect(screen.getByText("Нужна сеть, чтобы играть кампанию")).toBeOnTheScreen();
    expect(screen.getByText("Повторить")).toBeOnTheScreen();
  });

  test("spends a move and shows the server's bearing of a tapped cell (LVL-01)", async () => {
    await renderScreen();
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
    await tap(0);
    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
    expect(screen.getByText(/^A1 → 6/)).toBeOnTheScreen();
  });

  test("sends nothing for an opened cell (LVL-02)", async () => {
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
    await loseByMoves();
    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
  });

  test("continues once for ◆ on the server, then offers only a restart (LVL-13, LVL-15)", async () => {
    useAccountStore.getState().markSignedIn();
    await renderScreen();
    await loseByMoves();
    await continueForEmeralds();
    expect(screen.getByText("3 / 7")).toBeOnTheScreen();

    await tap(5, 6, 7);
    await settle();
    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
    expect(screen.queryByTestId("continue-emeralds")).toBeNull();
    expect(screen.getByText("Начать заново")).toBeOnTheScreen();
  });

  test("hides the ad continue in the campaign (decision 0060 #4)", async () => {
    await renderScreen();
    await loseByMoves();
    await flushRequests();

    expect(screen.queryByTestId("continue-ad")).toBeNull();
    expect(screen.getByTestId("continue-emeralds")).toBeOnTheScreen();
  });

  test("opens the ways to earn when ◆ run short", async () => {
    useAccountStore.getState().markSignedIn();
    mockServer.use(
      http.post(mockUrl("/campaign/games/:id/continue"), () =>
        HttpResponse.json(
          { error: { code: "not_enough_gems", details: { need: 5, currency: "gems" } } },
          { status: 409 },
        ),
      ),
    );
    await renderScreen();
    await loseByMoves();
    await continueForEmeralds();

    expect(screen.getByText("Где получить изумруды:")).toBeOnTheScreen();
  });

  test("shows the server's secrets after declining to continue", async () => {
    await renderScreen();
    await loseByMoves();
    await fireEvent.press(screen.getByText("Не продолжать"));
    await flushRequests();
    expect(screen.getByTestId("hidden-shown")).toBeOnTheScreen();
  });

  test("wins with the server's stars, moves and reward and moves to the next level (LVL-11, LVL-12)", async () => {
    await renderScreen();
    await tap(TARGET);
    await settle();
    expect(screen.getByText("Уровень 1 пройден")).toBeOnTheScreen();
    expect(screen.getByLabelText("Звёзды: 3 из 3")).toBeOnTheScreen();
    expect(screen.getByText("1 из 4 · лучший: 1")).toBeOnTheScreen();
    expect(screen.getByText("+50")).toBeOnTheScreen();
    expect(screen.getByText("+10 XP")).toBeOnTheScreen();

    await fireEvent.press(screen.getByText("Дальше"));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "2" },
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
    useAccountStore.getState().markSignedIn();
    await renderScreen();
    await loseByMoves();
    await continueForEmeralds();
    await tap(TARGET);
    await settle();
    expect(screen.getByLabelText("Звёзды: 1 из 3")).toBeOnTheScreen();
  });

  test("keeps flags on the device by long press or in flag mode without a move (LVL-20)", async () => {
    await renderScreen();
    await fireEvent(screen.getByTestId("cell-5"), "longPress");
    expect(useCampaignFlagsStore.getState().flags).toEqual([5]);

    await fireEvent.press(screen.getByTestId("flag-mode"));
    await tap(6);
    expect(useCampaignFlagsStore.getState().flags).toEqual([5, 6]);
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
  });

  test("asks before restarting a started game and starts a new one on the server", async () => {
    await renderScreen();
    await tap(0);
    await fireEvent.press(screen.getByTestId("restart"));
    await fireEvent.press(screen.getByText("Заново"));
    await flushUntil(() => screen.queryByText("4 / 4") !== null);
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();
  });

  test("restarts an untouched game without asking", async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId("restart"));
    expect(screen.queryByText("Начать заново? Ходы сбросятся")).toBeNull();
  });

  test("offers to continue the server's unfinished game with its flags (LVL-19)", async () => {
    const first = await renderScreen();
    await tap(0);
    await fireEvent(screen.getByTestId("cell-5"), "longPress");
    await first.unmount();

    await renderScreen();
    expect(screen.getByText("Продолжить или начать заново?")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Продолжить"));
    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
    expect(useCampaignFlagsStore.getState().flags).toEqual([5]);
  });

  test("resumes without asking when Home already chose «Продолжить» (decision 0041 #3)", async () => {
    const first = await renderScreen();
    await tap(0);
    await first.unmount();
    mockParams.resume = "1";

    await renderScreen();

    expect(screen.queryByText("Продолжить или начать заново?")).toBeNull();
    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
  });

  test("shows the lose sheet again for a lost game the server keeps", async () => {
    const first = await renderScreen();
    await loseByMoves();
    await fireEvent.press(screen.getByText("К уровням"));
    await first.unmount();

    await renderScreen();

    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
  });

  test("takes the server's game when a repeated tap is stale (decision 0060 #2)", async () => {
    await renderScreen();
    const overview = await apiClient.GET("/campaign");
    const gameId = overview.data?.active?.gameId ?? "";
    await apiClient.POST("/campaign/games/{id}/tap", {
      params: { path: { id: gameId } },
      body: { row: 0, col: 0, seq: 0 },
    });

    await tap(1);

    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
    expect(screen.getByText(/^A1 → 6/)).toBeOnTheScreen();
  });

  test("waits with a retry when the network drops during a tap (decision 0060 #3)", async () => {
    mockServer.use(
      http.post(mockUrl("/campaign/games/:id/tap"), () => HttpResponse.error(), { once: true }),
    );
    await renderScreen();
    await tap(0);

    expect(screen.getByText("Нет связи с сервером")).toBeOnTheScreen();
    expect(screen.getByText("4 / 4")).toBeOnTheScreen();

    await fireEvent.press(screen.getByText("Повторить"));
    await flushRequests();

    expect(screen.queryByTestId("retry-bar")).toBeNull();
    expect(screen.getByText("3 / 4")).toBeOnTheScreen();
  });

  test("keeps the game on the server when leaving from the pause menu", async () => {
    await renderScreen();
    await tap(0);
    await fireEvent.press(screen.getByTestId("pause"));
    await act(async () => fireEvent.press(screen.getByText("К уровням")));

    expect(mockRouter.back).toHaveBeenCalled();
    const overview = await apiClient.GET("/campaign");
    expect(overview.data?.active).toMatchObject({ level: 1 });
  });

  test("opens and closes the pause menu", async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId("pause"));
    expect(screen.getByText("Пауза · партия сохранится")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Продолжить"));
    expect(screen.queryByText("Пауза · партия сохранится")).toBeNull();
  });
});
