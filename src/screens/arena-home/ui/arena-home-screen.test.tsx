import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { CAMPAIGN_LEVELS } from "@entities/level";
import { matchSession } from "@entities/match";
import { useProgressStore } from "@entities/progress";
import { useAccountStore } from "@entities/session";
import { apiClient } from "@shared/api";
import { recordMockMatch } from "@shared/api/mocks/mock-arena-profile";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaHomeScreen from "./arena-home-screen";

const mockRouter = { push: jest.fn(), navigate: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardMapPreview: () => null }));

const MAP = {
  rows: 5,
  cols: 5,
  targets: [[2, 2]] as [number, number][],
  bombs: [[0, 0]] as [number, number][],
  streams: [
    [1, 2],
    [2, 1],
    [3, 2],
  ] as [number, number][],
};
const DRAFT = { ...MAP, targets: [] };

const passLevels = (count: number) =>
  useProgressStore.setState({
    best: Object.fromEntries(
      CAMPAIGN_LEVELS.slice(0, count).map(({ level }) => [level.id, { stars: 3, moves: 5 }]),
    ),
  });

const saveMap = async (name: string, map = MAP) =>
  (await apiClient.POST("/arena/maps", { body: { name, format: 5, map } })).data?.id ?? "";

const activate = (id: string) =>
  apiClient.POST("/arena/maps/{id}/activate", { params: { path: { id } } });

const win = (matchId: string, isBot = false) =>
  recordMockMatch({
    outcome: "win",
    kind: isBot ? "bot" : "ranked",
    opponentTrophies: 0,
    details: {
      matchId,
      mode: isBot ? "bot" : "ranked",
      opponent: {
        id: "u2",
        nickname: isBot ? "Calm" : "Kira",
        league: "BRONZE",
        isBot,
        label: null,
      },
      result: "win",
      reason: "targets",
      turns: { me: 5, opponent: 5 },
      endedAt: "2026-10-18T12:00:00Z",
      maps: { mine: MAP, opponent: MAP },
      taps: [],
    },
  });

const renderArena = async () => {
  await render(<ArenaHomeScreen />, { wrapper: createQueryWrapper() });
};

const renderOpenArena = async () => {
  passLevels(12);
  await apiClient.POST("/arena/onboarding");
  await apiClient.POST("/arena/season/summary/claim");
  await renderArena();
  await screen.findByText("Сигнал против сигнала.");
};

describe("ArenaHomeScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.push.mockClear();
    mockRouter.navigate.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useProgressStore.getState().reset();
    useAccountStore.getState().reset();
    jest.restoreAllMocks();
    await act(async () => onlineManager.setOnline(true));
  });

  test("shows the lock and the progress to level 12 (ARN-01)", async () => {
    passLevels(9);
    await renderArena();

    expect(screen.getByText("Арена закрыта")).toBeOnTheScreen();
    expect(screen.getByText("9 / 12")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("arena-to-levels"));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/levels");
  });

  test("opens the onboarding on the first visit of the open arena (decision 0037 #4)", async () => {
    passLevels(12);
    await renderArena();

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/arena/onboarding"));
  });

  test("skips the onboarding once it is done", async () => {
    await renderOpenArena();

    expect(mockRouter.push).not.toHaveBeenCalledWith("/arena/onboarding");
  });

  test("shows the summary of the finished season once (decision 0038 #2, design 18.3)", async () => {
    passLevels(12);
    await apiClient.POST("/arena/onboarding");
    await renderArena();

    expect(await screen.findByText("Сезон 01 завершён")).toBeOnTheScreen();
    expect(screen.getByText("Пик: GOLD I")).toBeOnTheScreen();
    expect(screen.getByText("Место #312 в мире · 64 победы")).toBeOnTheScreen();
    expect(screen.getByTestId("summary-reset")).toHaveTextContent(
      /3[\s\u00a0\u202f]120.*2[\s\u00a0\u202f]560/,
    );
    await fireEvent.press(screen.getByTestId("summary-claim"));
    expect(await screen.findByTestId("summary-claimed")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("summary-next"));

    await waitFor(() => expect(screen.queryByTestId("season-summary")).toBeNull());
    expect((await apiClient.GET("/me")).data?.wallet.coins).toBeGreaterThanOrEqual(1500);
  });

  test("claims the season rewards when the summary is closed unclaimed (decision 0038 #3)", async () => {
    passLevels(12);
    await apiClient.POST("/arena/onboarding");
    await renderArena();

    await fireEvent.press(await screen.findByTestId("summary-next"));

    await waitFor(() => expect(screen.queryByTestId("season-summary")).toBeNull());
    expect((await apiClient.GET("/arena")).data?.lastSeason).toBeNull();
  });

  test("keeps the summary away while the onboarding is due", async () => {
    passLevels(12);
    await renderArena();

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/arena/onboarding"));
    expect(screen.queryByTestId("season-summary")).toBeNull();
  });

  test("shows the arena ban with the term and leads to the campaign (ACC-14)", async () => {
    passLevels(12);
    mockServer.use(
      http.get(mockUrl("/arena"), () =>
        HttpResponse.json(
          {
            error: {
              code: "BANNED",
              details: { scope: "arena", until: "2026-10-12T00:00:00Z", reason: "бустинг кубков" },
            },
          },
          { status: 403 },
        ),
      ),
    );
    await renderArena();

    expect(await screen.findByText("Арена недоступна")).toBeOnTheScreen();
    expect(screen.getByText(/Причина: бустинг кубков\. До 12 октября/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("ban-campaign"));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/levels");
  });

  test("sends an appeal from the arena ban (decision 0038 #5)", async () => {
    passLevels(12);
    mockServer.use(
      http.get(mockUrl("/arena"), () =>
        HttpResponse.json(
          { error: { code: "BANNED", details: { scope: "arena", until: null, reason: "читы" } } },
          { status: 403 },
        ),
      ),
    );
    await renderArena();
    await fireEvent.press(await screen.findByTestId("ban-appeal"));
    expect(screen.getByTestId("support-send")).toBeDisabled();

    await fireEvent.changeText(screen.getByTestId("support-message"), "Это не я");
    await waitFor(() => expect(screen.getByTestId("support-send")).toBeEnabled());
    await fireEvent.press(screen.getByTestId("support-send"));

    expect(await screen.findByText("Обращение отправлено")).toBeOnTheScreen();
  });

  test("shows the league, the trophies, the season and the format", async () => {
    await renderOpenArena();

    expect(screen.getAllByText("BRONZE III").length).toBeGreaterThan(0);
    expect(screen.getByText("5×5 · 1 цели · 5 с на ход")).toBeOnTheScreen();
    expect(screen.getByText("0 / 267 → BRONZE II")).toBeOnTheScreen();
    expect(screen.getByText(/^02 · \d+д$/)).toBeOnTheScreen();
    expect(screen.getByTestId("arena-fight")).toBeEnabled();
  });

  test("offers to build a map when there is none and hides the empty history", async () => {
    await renderOpenArena();

    expect(screen.getByText("Карты пока нет")).toBeOnTheScreen();
    expect(screen.queryByText("История матчей")).toBeNull();
  });

  test("shows the active map with the bot estimate and defences", async () => {
    await activate(await saveMap("Fort"));
    await renderOpenArena();

    expect(await screen.findByText("Fort · активная")).toBeOnTheScreen();
    expect(screen.getByText(/^Бот решает за ~\d+ ход/)).toBeOnTheScreen();
    expect(screen.getByText("Защита: 0")).toBeOnTheScreen();
  });

  test("switches the active map and keeps a draft out of reach (decision 0031 #6)", async () => {
    await activate(await saveMap("Fort"));
    const secondId = await saveMap("Reef");
    const draftId = await saveMap("Draft", DRAFT);
    await renderOpenArena();
    await screen.findByText("Fort · активная");

    await fireEvent.press(screen.getByTestId("map-switch"));
    expect(screen.getByText("черновик — карта невалидна")).toBeOnTheScreen();
    expect(screen.getByTestId(`map-option-${draftId}`)).toBeDisabled();
    await fireEvent.press(screen.getByTestId(`map-option-${secondId}`));

    expect(await screen.findByText("Reef · активная")).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText("Мои карты")).toBeNull());
  });

  test("opens the editor for a new map and for the active one (decision 0032 #13)", async () => {
    await renderOpenArena();

    await fireEvent.press(screen.getByTestId("map-create"));
    expect(mockRouter.push).toHaveBeenLastCalledWith({
      pathname: "/arena/map/[id]",
      params: { id: "new" },
    });
  });

  test("offers a new map in the switch sheet while there are fewer than three", async () => {
    const id = await saveMap("Fort");
    await activate(id);
    await renderOpenArena();
    await screen.findByText("Fort · активная");

    await fireEvent.press(screen.getByTestId("map-switch"));
    await fireEvent.press(screen.getByTestId("map-new"));
    expect(mockRouter.push).toHaveBeenLastCalledWith({
      pathname: "/arena/map/[id]",
      params: { id: "new" },
    });
    await fireEvent.press(screen.getByTestId("map-edit"));

    expect(mockRouter.push).toHaveBeenLastCalledWith({
      pathname: "/arena/map/[id]",
      params: { id },
    });
  });

  test("offers linking to a guest before the first fight, then searches on «Позже» (ARN-02)", async () => {
    const search = jest.spyOn(matchSession, "search").mockImplementation(() => undefined);
    await activate(await saveMap("Fort"));
    await renderOpenArena();
    await screen.findByText("Fort · активная");

    await fireEvent.press(screen.getByTestId("arena-fight"));
    expect(useAccountStore.getState().offer).toBe("arena");
    expect(search).not.toHaveBeenCalled();
    await act(async () => useAccountStore.getState().declineOffer());

    expect(search).toHaveBeenCalledWith(5, expect.any(String));
    expect(mockRouter.push).toHaveBeenLastCalledWith("/arena/search");
  });

  test("asks to build or draw a map when there is no active one (ARN-03)", async () => {
    useAccountStore.getState().markSignedIn();
    const search = jest.spyOn(matchSession, "search").mockImplementation(() => undefined);
    await renderOpenArena();

    await fireEvent.press(screen.getByTestId("arena-fight"));
    expect(screen.getByText("Нет карты для боя")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Случайная"));

    await waitFor(() => expect(search).toHaveBeenCalledWith(5, expect.any(String)));
    const { data } = await apiClient.GET("/arena");
    expect(data?.activeMapId).toEqual(expect.any(String));
  });

  test("starts a match against another player's map (decision 0036 #3)", async () => {
    await renderOpenArena();

    await fireEvent.press(screen.getByTestId("arena-async"));

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/async/[id]",
        params: { id: "async_1" },
      }),
    );
  });

  test("claims an available season step and marks it claimed", async () => {
    Array.from({ length: 5 }, (_, index) => win(`m${index}`));
    await renderOpenArena();

    await fireEvent.press(await screen.findByRole("button", { name: "Забрать" }));

    expect(await screen.findAllByLabelText("Получено")).toHaveLength(1);
    await waitFor(() => expect(screen.getByLabelText("Монеты: 20320")).toBeOnTheScreen());
  });

  test("lists the last matches and opens one (decision 0031 #7)", async () => {
    win("m1");
    win("m2", true);
    await renderOpenArena();

    expect(await screen.findByText("Победа · 5 ходов")).toBeOnTheScreen();
    expect(screen.getByText("Победа · 5 ходов · тренировочный")).toBeOnTheScreen();
    expect(screen.getByText("БОТ")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("match-row-m1"));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/arena/history/[id]",
      params: { id: "m1" },
    });
  });

  test("keeps the cached arena offline and disables the fight (decision 0031 #11)", async () => {
    await renderOpenArena();

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByTestId("arena-offline")).toBeOnTheScreen();
    expect(screen.getByText("Нужен интернет")).toBeOnTheScreen();
  });

  test("shows a skeleton while the arena loads", async () => {
    let release = () => {};
    const isReleased = new Promise<void>((resolve) => {
      release = resolve;
    });
    mockServer.use(
      http.get(mockUrl("/arena"), async () => {
        await isReleased;
        return undefined;
      }),
    );
    passLevels(12);
    await renderArena();

    expect(screen.getByTestId("arena-skeleton", { includeHiddenElements: true })).toBeOnTheScreen();
    release();
    await screen.findByText("Сигнал против сигнала.");
  });

  test("shows an error with a retry and the code", async () => {
    let isBroken = true;
    mockServer.use(
      http.get(mockUrl("/arena"), () =>
        isBroken
          ? HttpResponse.json({ error: { code: "RATE_LIMITED" } }, { status: 429 })
          : undefined,
      ),
    );
    passLevels(12);
    await renderArena();

    expect(await screen.findByText("RATE_LIMITED")).toBeOnTheScreen();
    isBroken = false;
    await fireEvent.press(screen.getByTestId("arena-retry"));

    expect(await screen.findByText("Сигнал против сигнала.")).toBeOnTheScreen();
  });
});
