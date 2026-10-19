import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { matchSession, useMatchStore } from "@entities/match";
import type { MatchEnd, MatchOpponent } from "@entities/match";
import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaResultScreen from "./arena-result-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn() };
const mockInterstitial = { finishLevel: jest.fn(), showIfDue: jest.fn(async () => undefined) };

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
jest.mock("@features/show-interstitial", () => ({ useInterstitial: () => mockInterstitial }));

const OPPONENT: MatchOpponent = {
  id: "u2",
  nickname: "Kira",
  league: "GOLD",
  trophies: 0,
  isBot: false,
  label: null,
};
const FORMAT = { size: 5, targets: 1, turnSec: 5, bombHint: true, maxTurns: 40 };

const endOf = (overrides: Partial<MatchEnd> = {}): MatchEnd => ({
  result: "win",
  reason: "targets",
  turns: { me: 9, opponent: 8 },
  maps: { mine: { targets: [], bombs: [] }, opponent: { targets: [[2, 2]], bombs: [] } },
  trophies: { before: 0, after: 30, delta: 30 },
  league: { changed: false },
  rp: 10,
  rewards: [{ currency: "coin", amount: 40 }, { currency: "emerald", amount: 3 }, { xp: 10 }],
  ...overrides,
});

const finished = (end: MatchEnd, opponent = OPPONENT) =>
  useMatchStore.setState({
    phase: "ended",
    matchId: "m1",
    opponent,
    format: FORMAT,
    layout: {},
    end,
  });

const renderResult = async () => {
  await render(<ArenaResultScreen />, { wrapper: createQueryWrapper() });
};

describe("ArenaResultScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    Object.values(mockRouter).forEach((mock) => mock.mockClear());
    mockInterstitial.finishLevel.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
    useMatchStore.getState().reset();
    useAccountStore.getState().reset();
    mockServer.reset();
  });

  test("shows a win with trophies and rewards (PVP-22, PVP-25)", async () => {
    finished(endOf());
    await renderResult();

    expect(screen.getByText("Победа")).toBeOnTheScreen();
    expect(screen.getByText("Все сигналы найдены за 9 ходов")).toBeOnTheScreen();
    expect(screen.getByTestId("result-trophies")).toHaveTextContent("+30 кубков");
    expect(screen.getByText("+10 RP")).toBeOnTheScreen();
    expect(screen.getByText("+40")).toBeOnTheScreen();
    expect(screen.getByText("+3")).toBeOnTheScreen();
    expect(screen.getByText("+10 XP")).toBeOnTheScreen();
  });

  test("shows a loss with the winner's moves and no coins (decision 0035 #1)", async () => {
    finished(
      endOf({
        result: "loss",
        trophies: { before: 30, after: 15, delta: -15 },
        rp: 3,
        rewards: [{ xp: 5 }],
      }),
    );
    await renderResult();

    expect(screen.getByText("Поражение")).toBeOnTheScreen();
    expect(screen.getByText("Все сигналы найдены за 8 ходов")).toBeOnTheScreen();
    expect(screen.getByTestId("result-trophies")).toHaveTextContent("−15 кубков");
    expect(screen.queryByText("+40")).toBeNull();
  });

  test("explains a draw by the equal-turns rule (PVP-10)", async () => {
    finished(endOf({ result: "draw", trophies: { before: 0, after: 0, delta: 0 }, rp: 4 }));
    await renderResult();

    expect(screen.getByText("Ничья")).toBeOnTheScreen();
    expect(screen.getByText("оба нашли все цели — правило равных ходов")).toBeOnTheScreen();
  });

  test("notes the halved trophies against the bot (PVP-31)", async () => {
    finished(endOf(), { ...OPPONENT, isBot: true, label: "training" });
    await renderResult();

    expect(
      screen.getByText("За матч с тренировочным соперником — половина кубков"),
    ).toBeOnTheScreen();
  });

  test("celebrates a new league before the result (E4-7, decision 0035 #2)", async () => {
    finished(
      endOf({ trophies: { before: 790, after: 820, delta: 30 }, league: { changed: true } }),
    );
    await renderResult();

    expect(screen.getByText("Новая лига: SILVER")).toBeOnTheScreen();
    expect(screen.getByText("Упасть ниже SILVER в этом сезоне нельзя")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("league-next"));

    expect(screen.queryByTestId("league-moment")).toBeNull();
  });

  test("tells about a league drop without the floor line", async () => {
    finished(
      endOf({
        result: "loss",
        trophies: { before: 810, after: 790, delta: -20 },
        league: { changed: true },
      }),
    );
    await renderResult();

    expect(screen.getByText("Ты в лиге BRONZE")).toBeOnTheScreen();
    expect(screen.queryByText(/Упасть ниже/)).toBeNull();
  });

  test("opens a map at full width on a tap", async () => {
    finished(endOf());
    await renderResult();

    await fireEvent.press(screen.getByTestId("result-their-map"));

    expect(screen.getAllByText("Карта Kira").length).toBeGreaterThan(0);
  });

  test("goes back to the arena and counts the match for the interstitial (decision 0035 #7)", async () => {
    const leave = jest.spyOn(matchSession, "leave").mockImplementation(() => undefined);
    finished(endOf());
    await renderResult();

    await fireEvent.press(screen.getByTestId("result-arena"));

    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    expect(mockInterstitial.finishLevel).toHaveBeenCalled();
    expect(leave).toHaveBeenCalled();
  });

  test("keeps the result on screen while «Ещё бой» asks for a map (decision 0035 #6)", async () => {
    useAccountStore.getState().markSignedIn();
    finished(endOf());
    await renderResult();

    await fireEvent.press(screen.getByTestId("result-again"));

    expect(await screen.findByText("Нет карты для боя")).toBeOnTheScreen();
    expect(screen.getByText("Победа")).toBeOnTheScreen();
    expect(useMatchStore.getState().end).toBeNull();
  });
});
