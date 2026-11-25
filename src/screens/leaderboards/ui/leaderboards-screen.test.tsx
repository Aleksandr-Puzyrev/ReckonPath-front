import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { ADD_FRIEND_PARAM } from "@entities/friend";
import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { formatNumber } from "@shared/lib";
import { mockServer, mockUrl, setMockFriends } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import LeaderboardsScreen from "./leaderboards-screen";

const mockRouter = { back: jest.fn(), push: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));

const HTTP_SERVER_ERROR = 500;

const renderLeaderboards = async () => {
  useAccountStore.getState().markSignedIn();
  await render(<LeaderboardsScreen />, { wrapper: createQueryWrapper() });
};

const recordBoardRequests = () => {
  const queries: string[] = [];
  mockServer.use(
    http.get(mockUrl("/arena/leaderboard"), ({ request }) => {
      queries.push(new URL(request.url).search);
    }),
  );
  return queries;
};

const emptyBoard = () =>
  mockServer.use(
    http.get(mockUrl("/arena/leaderboard"), () =>
      HttpResponse.json({
        period: "week",
        scope: "all",
        endsAt: new Date(Date.now() + 86_400_000 * 3).toISOString(),
        items: [],
      }),
    ),
  );

describe("LeaderboardsScreen (decision 0066)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => jest.clearAllMocks());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("asks for the chosen period and scope (#2)", async () => {
    const queries = recordBoardRequests();
    await renderLeaderboards();
    await screen.findByText("Nova");

    await fireEvent.press(screen.getByTestId("leaderboards-period-season"));
    await screen.findByText("Mila");
    await fireEvent.press(screen.getByTestId("leaderboards-scope-friends"));
    await waitFor(() => expect(screen.queryByText("Mila")).toBeNull());

    expect(queries).toEqual([
      "?period=week&scope=all",
      "?period=season&scope=all",
      "?period=season&scope=friends",
    ]);
  });

  test("lists the weekly net change, a loss with a minus (#13)", async () => {
    await renderLeaderboards();

    expect(await screen.findByText("Miron")).toBeOnTheScreen();
    expect(screen.getByText(formatNumber(-18, "ru"))).toBeOnTheScreen();
    expect(screen.getByLabelText("7 место, Miron, -18 кубков")).toBeOnTheScreen();
    expect(screen.getByTestId("leaderboards-timer")).toHaveTextContent(/^обнуление через /);
  });

  test("hints to play a match when the server sends no row of mine (#3)", async () => {
    await renderLeaderboards();
    await screen.findByText("Nova");

    expect(screen.getByTestId("leaders-no-me")).toHaveTextContent(
      "Сыграй матч на этой неделе, чтобы попасть в таблицу",
    );
  });

  test("pins my row and keeps it off the profile links (#3, #9)", async () => {
    await renderLeaderboards();
    await screen.findByText("Nova");

    await fireEvent.press(screen.getByTestId("leaderboards-period-season"));

    const pinned = await screen.findByTestId("leaderboards-mine");
    expect(pinned).toHaveTextContent(/Ты/);
    expect(screen.getByTestId("leaderboards-timer")).toHaveTextContent(/^сезон: ещё /);
    for (const row of screen.getAllByTestId("leader-me")) await fireEvent.press(row);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test("opens another player's profile from a row (#9)", async () => {
    await renderLeaderboards();

    await fireEvent.press(await screen.findByTestId("leader-mock-1"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/user/[id]",
      params: { id: "mock-1" },
    });
  });

  test("invites friends from the empty friends board (design 18.2)", async () => {
    setMockFriends({ friends: {} });
    await renderLeaderboards();
    await screen.findByText("Nova");

    await fireEvent.press(screen.getByTestId("leaderboards-scope-friends"));
    await fireEvent.press(await screen.findByTestId("leaderboards-invite"));

    expect(
      screen.getByText("Здесь появятся друзья и их кубки. Соревноваться со своими веселее."),
    ).toBeOnTheScreen();
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/friends",
      params: { add: ADD_FRIEND_PARAM },
    });
  });

  test("says no one has played yet on an empty board", async () => {
    emptyBoard();
    await renderLeaderboards();

    expect(await screen.findByText("Пока никто не играл — стань первым")).toBeOnTheScreen();
    expect(screen.queryByTestId("leaderboards-mine")).toBeNull();
  });

  test("offers to try again after an error with its code", async () => {
    mockServer.use(
      http.get(
        mockUrl("/arena/leaderboard"),
        () =>
          HttpResponse.json({ error: { code: "internal_error" } }, { status: HTTP_SERVER_ERROR }),
        { once: true },
      ),
    );
    await renderLeaderboards();

    const retry = await screen.findByTestId("leaderboards-retry");
    expect(screen.getByTestId("leaderboards-error-code")).toHaveTextContent("internal_error");
    await act(async () => fireEvent.press(retry));

    expect(await screen.findByText("Nova")).toBeOnTheScreen();
  });

  test("keeps the cached board with the offline bar (#15)", async () => {
    await renderLeaderboards();
    await screen.findByText("Nova");

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByTestId("leaderboards-offline")).toHaveTextContent("Нет сети");
    expect(screen.getByText("Nova")).toBeOnTheScreen();
  });

  test("shows the offline bar once when there is no cache", async () => {
    await act(async () => onlineManager.setOnline(false));
    await renderLeaderboards();

    expect(screen.getAllByText("Нет сети")).toHaveLength(1);
    expect(screen.queryByTestId("leaderboards-skeleton")).toBeNull();
  });
});
