import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { matchSession, useMatchStore } from "@entities/match";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaSearchScreen from "./arena-search-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@widgets/board", () => ({ BoardMapPreview: () => null }));

const OPPONENT = {
  id: "u2",
  nickname: "Kira",
  league: "GOLD",
  division: 1,
  trophies: 2910,
  isBot: false,
  label: null,
};
const BOT = { ...OPPONENT, nickname: "Calm", isBot: true, label: "training" };
const FORMAT = { size: 5, targets: 1, turnSec: 5, bombHint: true, maxTurns: 40 };

const renderSearch = async () => {
  await render(<ArenaSearchScreen />, { wrapper: createQueryWrapper() });
};

const setMatch = (state: Partial<ReturnType<typeof useMatchStore.getState>>) =>
  act(() => useMatchStore.setState(state));

describe("ArenaSearchScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.back.mockClear();
    mockRouter.replace.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
    useMatchStore.getState().reset();
    mockServer.reset();
  });

  test("shows the waiting time and the search title (decision 0033 #5)", async () => {
    useMatchStore.setState({ phase: "searching", waitedSec: 7 });
    await renderSearch();

    expect(screen.getByText("Ищем соперника…")).toBeOnTheScreen();
    expect(screen.getByTestId("search-timer")).toHaveTextContent("0:07");
    expect(screen.queryByTestId("search-vs-map")).toBeNull();
  });

  test("switches to the async match from 10 s (ARN-06, decision 0036 #3)", async () => {
    const cancel = jest.spyOn(matchSession, "cancelSearch").mockImplementation(() => undefined);
    useMatchStore.setState({ phase: "searching", waitedSec: 10, isAsyncAvailable: true });
    await renderSearch();

    await fireEvent.press(screen.getByTestId("search-vs-map"));

    expect(cancel).toHaveBeenCalled();
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/arena/async/[id]",
        params: { id: "async_1" },
      }),
    );
  });

  test("cancels the search (ARN-07)", async () => {
    const cancel = jest.spyOn(matchSession, "cancelSearch");
    useMatchStore.setState({ phase: "searching" });
    await renderSearch();

    await fireEvent.press(screen.getByTestId("search-cancel"));

    expect(cancel).toHaveBeenCalled();
    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("tells about the locked signal when the bot comes after 20 s (decision 0033 #2)", async () => {
    useMatchStore.setState({ phase: "found", opponent: BOT, format: FORMAT, matchId: "m1" });
    await renderSearch();

    expect(screen.getByText("Сигнал захвачен")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("search-to-match"));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/arena/match/[id]",
      params: { id: "m1" },
    });
  });

  test("shows VS with the coin toss and then who goes first (decision 0033 #8)", async () => {
    useMatchStore.setState({ phase: "intro", opponent: OPPONENT, format: FORMAT, matchId: "m1" });
    await renderSearch();

    expect(screen.getByText("Kira")).toBeOnTheScreen();
    expect(screen.getByTestId("versus-coin")).toHaveTextContent("Жребий…");
    await setMatch({ phase: "opponentTurn", firstPlayer: "opponent", current: "opponent" });

    expect(screen.getByTestId("versus-coin")).toHaveTextContent("Первым ходит: Kira");
  });

  test("labels the practice opponent on VS (PVP-31)", async () => {
    useMatchStore.setState({ phase: "intro", opponent: BOT, format: FORMAT, matchId: "m1" });
    await renderSearch();

    expect(screen.getByText("Тренировочный соперник")).toBeOnTheScreen();
    expect(
      screen.getByText("За матч с тренировочным соперником — половина кубков"),
    ).toBeOnTheScreen();
  });

  test("moves on to the match after VS", async () => {
    jest.useFakeTimers();
    useMatchStore.setState({ phase: "intro", opponent: OPPONENT, format: FORMAT, matchId: "m1" });
    await renderSearch();

    await setMatch({ phase: "myTurn", firstPlayer: "me", current: "me" });
    expect(screen.getByTestId("versus-coin")).toHaveTextContent("Первым ходишь: ты");
    await act(async () => jest.advanceTimersByTime(1_200));

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/arena/match/[id]",
      params: { id: "m1" },
    });
    jest.useRealTimers();
  });

  test("offers to search again after the app was minimised (decision 0033 #6)", async () => {
    useMatchStore.setState({ phase: "stopped" });
    await renderSearch();

    expect(screen.getByText("Приложение было свёрнуто — очередь сброшена")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("search-to-arena"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("offers to rejoin the match from another device (decision 0033 #4)", async () => {
    const returnTo = jest.spyOn(matchSession, "returnTo").mockImplementation(() => undefined);
    useMatchStore.setState({ phase: "idle", inMatch: { matchId: "m9", endpoint: "wss://n/m9" } });
    await renderSearch();

    expect(screen.getByText("Ты уже в матче")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("search-rejoin"));

    expect(returnTo).toHaveBeenCalledWith("wss://n/m9");
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/arena/match/[id]",
      params: { id: "m9" },
    });
  });

  test("goes back to the arena and re-reads it after a ban (decision 0038 #6)", async () => {
    let arenaRequests = 0;
    mockServer.use(
      http.get(mockUrl("/arena"), () => {
        arenaRequests += 1;
        return HttpResponse.json(
          {
            error: { code: "BANNED", details: { scope: "arena", until: null, reason: "Boosting" } },
          },
          { status: 403 },
        );
      }),
    );
    useMatchStore.setState({ phase: "searching" });
    await renderSearch();
    const before = arenaRequests;

    await setMatch({ phase: "idle", searchError: "BANNED" });

    expect(await screen.findByText("Доступ ограничен")).toBeOnTheScreen();
    expect(mockRouter.back).toHaveBeenCalled();
    await waitFor(() => expect(arenaRequests).toBeGreaterThan(before));
  });

  test("goes back with a toast when the search loses the connection", async () => {
    useMatchStore.setState({ phase: "searching" });
    await renderSearch();

    await setMatch({ phase: "idle", searchError: "NETWORK" });

    expect(await screen.findByText("Нет связи с сервером")).toBeOnTheScreen();
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
