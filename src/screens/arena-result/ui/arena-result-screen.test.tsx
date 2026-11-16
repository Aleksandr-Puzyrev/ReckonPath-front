import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useMatchStore } from "@entities/match";
import type { MatchView } from "@entities/match";
import { i18n } from "@shared/i18n";
import { doneMatchMock, mapMatchMock, mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaResultScreen from "./arena-result-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn() };
const mockInterstitial = { finishLevel: jest.fn(), showIfDue: jest.fn(async () => undefined) };
const mockParams = { id: "match-done" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: true,
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardMapPreview: () => null }));
jest.mock("@features/show-interstitial", () => ({ useInterstitial: () => mockInterstitial }));

const finished = (view: MatchView) => useMatchStore.getState().receive(view);

const renderResult = () => render(<ArenaResultScreen />, { wrapper: createQueryWrapper() });

describe("ArenaResultScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.back.mockClear();
    mockRouter.push.mockClear();
    mockInterstitial.finishLevel.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    useMatchStore.getState().reset();
    mockServer.reset();
  });

  test("shows the outcome, the reason, the trophies and the rewards of the server", async () => {
    const done = doneMatchMock();
    finished({ ...done, me: { ...done.me, moves: 9 } });
    await renderResult();

    expect(screen.getByText("Победа")).toBeOnTheScreen();
    expect(screen.getByText("Все сигналы найдены за 9 ходов")).toBeOnTheScreen();
    expect(screen.getByTestId("result-trophies")).toHaveTextContent("+16 кубков");
    expect(screen.getByText("+10 RP")).toBeOnTheScreen();
    expect(screen.getByText("+10 XP")).toBeOnTheScreen();
    expect(screen.getByText("+40")).toBeOnTheScreen();
    expect(screen.getByText("Карта Kira")).toBeOnTheScreen();
  });

  test("names the new reasons of the backend", async () => {
    const done = doneMatchMock();
    if (done.result === undefined) throw new Error("No result");
    finished({ ...done, result: { ...done.result, outcome: "loss", reason: "timeouts" } });
    await renderResult();

    expect(screen.getByText("Поражение")).toBeOnTheScreen();
    expect(screen.getByText("Три пропуска хода")).toBeOnTheScreen();
  });

  test("shows the new division as its own moment with the reward", async () => {
    const done = doneMatchMock();
    if (done.result === undefined) throw new Error("No result");
    finished({
      ...done,
      result: {
        ...done.result,
        promotion: {
          league: "bronze",
          title: "Bronze",
          division: "II",
          min: 200,
          coins: 300,
          gems: 20,
        },
      },
    });
    await renderResult();

    expect(screen.getByText("Новый дивизион: BRONZE II")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("league-next"));
    expect(screen.queryByTestId("league-moment")).toBeNull();
  });

  test("compares the moves with the norm after a map match", async () => {
    mockParams.id = "match-map";
    const map = mapMatchMock({ status: "done", norm: 12 });
    finished({
      ...map,
      me: { ...map.me, moves: 9 },
      result: {
        outcome: "win",
        reason: "norm",
        trophies: 8,
        trophyNow: 128,
        league: { league: "bronze", title: "Bronze", division: "III", min: 0 },
        coins: 20,
        gems: 0,
        xp: 5,
        rp: 10,
      },
    });
    await renderResult();

    expect(screen.getByText("Ты: 9 ходов · Норма: 12")).toBeOnTheScreen();
    expect(screen.getByText("Карта Kira · твои тапы")).toBeOnTheScreen();
    mockParams.id = "match-done";
  });

  test("reads a finished match from the server after a restart", async () => {
    mockParams.id = "match-3";
    await renderResult();

    expect(await screen.findByText("Победа")).toBeOnTheScreen();
    mockParams.id = "match-done";
  });

  test("counts the match for the interstitial and goes back to the arena", async () => {
    finished(doneMatchMock());
    await renderResult();

    await fireEvent.press(screen.getByTestId("result-arena"));

    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    expect(mockInterstitial.finishLevel).toHaveBeenCalled();
    expect(useMatchStore.getState().view).toBeNull();
  });
});
