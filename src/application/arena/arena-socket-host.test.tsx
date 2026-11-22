import { act, cleanup, render, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useMatchStore } from "@entities/match";
import { useAccountStore } from "@entities/session";
import { useMeQuery } from "@entities/wallet";
import { matchViewMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { mockArenaSocket } from "@shared/test-utils/mock-arena-socket";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaSocketHost from "./arena-socket-host";

const mockRouter = { push: jest.fn() };
let mockSegments: string[] = ["(tabs)"];

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useSegments: () => mockSegments,
}));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: true,
}));
jest.mock("@shared/ws", () => ({
  arenaSocket: jest.requireActual("@shared/test-utils/mock-arena-socket").mockArenaSocket,
}));

const renderHost = async () => {
  useAccountStore.getState().markSignedIn();
  await render(<ArenaSocketHost />, { wrapper: createQueryWrapper() });
};

const renderConnected = async () => {
  await renderHost();
  await waitFor(() => expect(mockArenaSocket.isOpen).toBe(true));
};

const pushMatch = (overrides: Parameters<typeof matchViewMock>[0]) =>
  act(() =>
    mockArenaSocket.push({
      type: "match",
      time: new Date().toISOString(),
      match: matchViewMock({ id: "match-friendly", ...overrides }),
    }),
  );

describe("ArenaSocketHost (decision 0062 #7)", () => {
  beforeEach(() => {
    mockSegments = ["(tabs)"];
    mockRouter.push.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    useMatchStore.getState().reset();
  });

  test("keeps the arena socket open app-wide while signed in", async () => {
    await renderHost();

    await waitFor(() => expect(mockArenaSocket.isOpen).toBe(true));
  });

  test("does not open the socket for an arena-banned player (decision 0062 #22)", async () => {
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
            bans: [{ scope: "arena", until: null, reason: "" }],
          },
          consents: [],
          consentsRequired: [],
        }),
      ),
    );
    const seen: { bans: unknown } = { bans: undefined };
    const MeProbe = () => {
      seen.bans = useMeQuery().data?.flags.bans;
      return null;
    };
    useAccountStore.getState().markSignedIn();

    await render(
      <>
        <MeProbe />
        <ArenaSocketHost />
      </>,
      { wrapper: createQueryWrapper() },
    );
    await waitFor(() => expect(seen.bans).toEqual([{ scope: "arena", until: null, reason: "" }]));

    expect(mockArenaSocket.isOpen).toBe(false);
  });

  test("forgets the match when the player signs out", async () => {
    await renderConnected();
    await pushMatch({ friendly: true });

    await cleanup();

    expect(useMatchStore.getState().view).toBeNull();
  });

  test("opens a friendly match that has already started", async () => {
    await renderConnected();

    await pushMatch({ friendly: true, status: "play" });

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "match-friendly" },
      }),
    );
  });

  test("opens a friendly match pushed in the prepare phase from any screen", async () => {
    mockSegments = ["friends"];
    await renderConnected();

    await pushMatch({ friendly: true });

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "match-friendly" },
      }),
    );
  });

  test("opens the friendly match once, however many pushes come", async () => {
    await renderConnected();

    await pushMatch({ friendly: true, seq: 1 });
    await pushMatch({ friendly: true, seq: 2 });

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledTimes(1));
  });

  test("leaves a match of the search to the search screen", async () => {
    mockSegments = ["arena", "search"];
    await renderConnected();

    await pushMatch({ friendly: true });
    await pushMatch({ id: "match-rated", friendly: undefined, seq: 3 });

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test("does not open a rated match by itself", async () => {
    await renderConnected();

    await pushMatch({ id: "match-rated" });

    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
