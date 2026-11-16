import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { gameLevelOfMap } from "@entities/arena-map";
import { useMatchStore } from "@entities/match";
import { useAccountStore } from "@entities/session";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import {
  arenaHomeMock,
  mockServer,
  mockUrl,
  passMockLevels,
  setMockArena,
} from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaHomeScreen from "./arena-home-screen";

const mockRouter = { push: jest.fn(), navigate: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: true,
}));
jest.mock("@shared/ws", () => ({
  arenaSocket: {
    open: () => undefined,
    close: () => undefined,
    onEvent: () => () => undefined,
    onReconnect: () => () => undefined,
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardMapPreview: () => null }));

const MAP = { rows: 6, cols: 6, targets: [[2, 2]] as [number, number][] };
const DRAFT = { ...MAP, targets: [] };

const saveMap = async (name: string, map = MAP) =>
  (await apiClient.POST("/arena/maps", { body: { name, level: gameLevelOfMap(map) } })).data?.id ??
  "";

const QUEUE = {
  joinedAt: "2026-11-02T12:00:00Z",
  serverTime: "2026-11-02T12:00:03Z",
  mapOfferAt: "2026-11-02T12:00:10Z",
  botAt: "2026-11-02T12:00:20Z",
};

const withArena = (overrides: Partial<ReturnType<typeof arenaHomeMock>>) =>
  mockServer.use(
    http.get(mockUrl("/arena"), () => HttpResponse.json({ ...arenaHomeMock([]), ...overrides })),
  );

const renderArena = () => render(<ArenaHomeScreen />, { wrapper: createQueryWrapper() });

const renderOpenArena = async () => {
  passMockLevels(12);
  await renderArena();
  await screen.findByText("Сигнал против сигнала.");
};

describe("ArenaHomeScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.push.mockClear();
    mockRouter.navigate.mockClear();
    useAccountStore.getState().markSignedIn();
  });

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    useMatchStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("shows the lock with the server's unlock level and no season over it", async () => {
    passMockLevels(9);
    setMockArena({ hasPastSeason: true });
    await renderArena();

    expect(await screen.findByText("Арена закрыта")).toBeOnTheScreen();
    expect(await screen.findByText("9 / 12")).toBeOnTheScreen();
    expect(screen.queryByTestId("season-summary")).toBeNull();
    await fireEvent.press(screen.getByTestId("arena-to-levels"));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/levels");
  });

  test("opens the rule cards while the server has not seen them", async () => {
    setMockArena({ rulesSeen: false, hasPastSeason: true });
    await renderOpenArena();

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/arena/onboarding"));
    expect(screen.queryByTestId("season-summary")).toBeNull();
  });

  test("shows the past season's result and claims it (decision 0060 #16 season)", async () => {
    setMockArena({ hasPastSeason: true });
    passMockLevels(12);
    await renderArena();

    expect(await screen.findByText("Сезон 01 завершён")).toBeOnTheScreen();
    expect(screen.getByText("Пик: GOLD I")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("summary-claim"));

    expect(await screen.findByTestId("summary-claimed")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("summary-next"));
    await waitFor(() => expect(screen.queryByTestId("season-summary")).toBeNull());
  });

  test("shows the arena ban from the player's flags (decision 0060 #14)", async () => {
    passMockLevels(12);
    mockServer.use(
      http.get(mockUrl("/me"), () =>
        HttpResponse.json({
          id: "u1",
          nickname: "test",
          locale: "ru",
          level: 1,
          xp: 0,
          xpToNext: 50,
          nicknameChange: { price: 0, currency: "coins" },
          flags: {
            deletionScheduledAt: null,
            bans: [{ scope: "arena", until: null, reason: "читы" }],
          },
          consents: [],
          consentsRequired: [],
        }),
      ),
    );
    await renderArena();

    expect(await screen.findByText("Арена недоступна")).toBeOnTheScreen();
    expect(screen.getByText(/читы/)).toBeOnTheScreen();
  });

  test("shows the arena ban from a 403 banned answer", async () => {
    passMockLevels(12);
    mockServer.use(
      http.get(mockUrl("/arena"), () =>
        HttpResponse.json(
          {
            error: {
              code: "banned",
              details: { scope: "arena", until: "2026-10-12T00:00:00Z", reason: "бустинг кубков" },
            },
          },
          { status: 403 },
        ),
      ),
    );
    await renderArena();

    expect(await screen.findByText("Арена недоступна")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("ban-campaign"));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/levels");
  });

  test("shows the server's league, its next step, the season and the format", async () => {
    await renderOpenArena();

    expect(screen.getAllByText("BRONZE III").length).toBeGreaterThan(0);
    expect(screen.getByText("6×6 · 1 цели · 10 с на ход")).toBeOnTheScreen();
    expect(screen.getByText("120 / 200 → BRONZE II")).toBeOnTheScreen();
    expect(screen.getByText(/^02 · \d+д$/)).toBeOnTheScreen();
  });

  test("shows the active map with the bot estimate and its defences", async () => {
    await saveMap("Fort");
    await renderOpenArena();

    expect(await screen.findByText("Fort · активная")).toBeOnTheScreen();
    expect(screen.getByText("Бот решает за ~4 хода")).toBeOnTheScreen();
    expect(screen.getByText("Защита: 0")).toBeOnTheScreen();
  });

  test("switches the active map and keeps a draft out of reach", async () => {
    await saveMap("Fort");
    const secondId = await saveMap("Reef");
    const draftId = await saveMap("Draft", DRAFT);
    await renderOpenArena();
    await screen.findByText("Fort · активная");

    await fireEvent.press(screen.getByTestId("map-switch"));
    expect(screen.getByTestId(`map-option-${draftId}`)).toBeDisabled();
    expect(screen.queryByTestId("map-new")).toBeNull();
    await fireEvent.press(screen.getByTestId(`map-option-${secondId}`));

    expect(await screen.findByText("Reef · активная")).toBeOnTheScreen();
  });

  test("joins the queue and opens the search", async () => {
    await renderOpenArena();

    await fireEvent.press(screen.getByTestId("arena-fight"));

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/arena/search"));
    expect(useMatchStore.getState().queue).toEqual(
      expect.objectContaining({ joinedAt: expect.any(String) }),
    );
  });

  test("opens the running match the server answers the search with", async () => {
    mockServer.use(
      http.post(mockUrl("/arena/queue"), () =>
        HttpResponse.json(
          { error: { code: "match_in_progress", details: { id: "m-running" } } },
          { status: 409 },
        ),
      ),
    );
    await renderOpenArena();

    await fireEvent.press(screen.getByTestId("arena-fight"));

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "m-running" },
      }),
    );
  });

  test("starts a match against a map", async () => {
    await renderOpenArena();

    await fireEvent.press(screen.getByTestId("arena-async"));

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "match-map" },
      }),
    );
    expect(useMatchStore.getState().view?.kind).toBe("map");
  });

  test("reopens an unfinished match at once", async () => {
    withArena({ match: { id: "m7", kind: "duel", status: "play" } });
    await renderOpenArena();

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "m7" },
      }),
    );
  });

  test("reopens a running search at once", async () => {
    withArena({ queue: { ...QUEUE, format: arenaHomeMock([]).league.format } });
    await renderOpenArena();

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/arena/search"));
    expect(useMatchStore.getState().queue?.joinedAt).toBe(QUEUE.joinedAt);
  });

  test("claims a ready season step and applies the new wallet", async () => {
    await renderOpenArena();

    await fireEvent.press(screen.getByRole("button", { name: "Забрать" }));

    expect(await screen.findAllByLabelText("Получено")).toHaveLength(1);
  });

  test("lists the last matches and opens one", async () => {
    await renderOpenArena();

    expect(screen.getAllByText("Победа · 8 ходов").length).toBeGreaterThan(0);
    expect(screen.getByText("Поражение · 8 ходов · тренировочный")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("match-row-match-2"));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/arena/history/[id]",
      params: { id: "match-2" },
    });
  });

  test("keeps the cached arena offline and disables the fight", async () => {
    await renderOpenArena();

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByTestId("arena-offline")).toBeOnTheScreen();
    expect(screen.getByTestId("arena-fight")).toBeDisabled();
  });

  test("shows an error with a retry and the code", async () => {
    let isBroken = true;
    mockServer.use(
      http.get(mockUrl("/arena"), () =>
        isBroken
          ? HttpResponse.json({ error: { code: "too_many_requests" } }, { status: 429 })
          : undefined,
      ),
    );
    passMockLevels(12);
    await renderArena();

    expect(await screen.findByText("too_many_requests")).toBeOnTheScreen();
    isBroken = false;
    await fireEvent.press(screen.getByTestId("arena-retry"));

    expect(await screen.findByText("Сигнал против сигнала.")).toBeOnTheScreen();
  });
});
