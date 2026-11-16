import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useMatchStore } from "@entities/match";
import { i18n } from "@shared/i18n";
import { matchViewMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaSearchScreen from "./arena-search-screen";

const mockRouter = { replace: jest.fn(), back: jest.fn(), push: jest.fn() };

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
jest.mock("@widgets/board", () => ({ BoardMapPreview: () => null }));

const SECOND_MS = 1000;

const queueAt = (now: number, waited: number) => ({
  joinedAt: new Date(now - waited * SECOND_MS).toISOString(),
  serverTime: new Date(now).toISOString(),
  mapOfferAt: new Date(now + (10 - waited) * SECOND_MS).toISOString(),
  botAt: new Date(now + (20 - waited) * SECOND_MS).toISOString(),
  format: matchViewMock().format,
});

const renderSearch = (waited: number) => {
  useMatchStore.getState().receiveQueue(queueAt(Date.now(), waited));
  return render(<ArenaSearchScreen />, { wrapper: createQueryWrapper() });
};

describe("ArenaSearchScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.replace.mockClear();
    mockRouter.back.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    useMatchStore.getState().reset();
    mockServer.reset();
  });

  test("counts the wait from joinedAt by the server clock and shows the format", async () => {
    await renderSearch(7);

    expect(screen.getByText("Ищем соперника…")).toBeOnTheScreen();
    expect(screen.getByTestId("search-timer")).toHaveTextContent("0:07");
    expect(screen.getByText("6×6 · BRONZE · 1 цели")).toBeOnTheScreen();
    expect(screen.queryByTestId("search-vs-map")).toBeNull();
  });

  test("offers the map match from mapOfferAt and opens it", async () => {
    await renderSearch(12);

    await fireEvent.press(screen.getByTestId("search-vs-map"));

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "match-map" },
      }),
    );
  });

  test("cancels the search with DELETE /arena/queue", async () => {
    const calls: string[] = [];
    mockServer.use(
      http.delete(mockUrl("/arena/queue"), () => {
        calls.push("leave");
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderSearch(3);

    await fireEvent.press(screen.getByTestId("search-cancel"));

    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    expect(calls).toEqual(["leave"]);
    expect(useMatchStore.getState().queue).toBeNull();
  });

  test("moves on to the match once a rival is found", async () => {
    await renderSearch(3);

    await act(async () => useMatchStore.getState().receive(matchViewMock({ id: "m-found" })));

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/arena/match/[id]",
      params: { id: "m-found" },
    });
  });

  test("reads the current match once the bot is due, in case the push was lost", async () => {
    mockServer.use(
      http.get(mockUrl("/arena/matches/current"), () =>
        HttpResponse.json(
          matchViewMock({ id: "m-bot", rival: { ...matchViewMock().rival, bot: true } }),
        ),
      ),
    );
    await renderSearch(21);

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "m-bot" },
      }),
    );
  });
});
