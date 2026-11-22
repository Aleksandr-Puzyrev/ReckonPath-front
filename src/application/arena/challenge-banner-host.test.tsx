import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useMatchStore } from "@entities/match";
import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import {
  incomingChallengeMock,
  mockServer,
  mockUrl,
  passMockLevels,
  setMockChallenges,
} from "@shared/test-utils/api-mock";
import { mockArenaSocket } from "@shared/test-utils/mock-arena-socket";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaSocketHost from "./arena-socket-host";
import ChallengeBannerHost from "./challenge-banner-host";

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

const ARENA_LEVEL = 12;
const SECOND_MS = 1000;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

const challengeFrom = (from: string, id: string, secondsLeft: number) =>
  incomingChallengeMock({
    id,
    from,
    expiresAt: new Date(Date.now() + secondsLeft * SECOND_MS).toISOString(),
  });

const renderHosts = async (passedLevels = ARENA_LEVEL) => {
  passMockLevels(passedLevels);
  useAccountStore.getState().markSignedIn();
  await render(
    <>
      <ArenaSocketHost />
      <ChallengeBannerHost />
    </>,
    { wrapper: createQueryWrapper() },
  );
};

const pushNotice = (id: string, status: "pending" | "cancelled") =>
  act(() =>
    mockArenaSocket.push({
      type: "challenge",
      time: new Date().toISOString(),
      challenge: { id, status },
    }),
  );

describe("ChallengeBannerHost (design 24.6, decision 0062 #23)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockSegments = ["(tabs)"];
    mockRouter.push.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    useMatchStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("shows the newest pending challenge with its format", async () => {
    setMockChallenges([challengeFrom("mock-5", "older", 20), challengeFrom("mock-2", "newer", 50)]);
    await renderHosts();

    expect(await screen.findByText("Kira вызывает на дуэль")).toBeOnTheScreen();
    expect(screen.getByText("6×6 · дружеский")).toBeOnTheScreen();
    expect(screen.queryByText("Milo вызывает на дуэль")).toBeNull();
  });

  test("appears when a challenge push comes and goes when it is cancelled", async () => {
    await renderHosts();
    await waitFor(() => expect(mockArenaSocket.isOpen).toBe(true));

    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    await pushNotice("challenge-in", "pending");
    expect(await screen.findByText("Kira вызывает на дуэль")).toBeOnTheScreen();

    setMockChallenges([{ ...challengeFrom("mock-2", "challenge-in", 50), status: "cancelled" }]);
    await pushNotice("challenge-in", "cancelled");
    await waitFor(() => expect(screen.queryByTestId("challenge-banner")).toBeNull());
  });

  test("re-reads the challenges after the socket reconnects", async () => {
    await renderHosts();
    await waitFor(() => expect(mockArenaSocket.isOpen).toBe(true));

    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    await act(() => mockArenaSocket.reconnect());

    expect(await screen.findByText("Kira вызывает на дуэль")).toBeOnTheScreen();
  });

  test("accepts the challenge and opens the friendly match", async () => {
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    await renderHosts();

    await fireEvent.press(await screen.findByTestId("challenge-accept"));

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "match-friendly" },
      }),
    );
    expect(screen.queryByTestId("challenge-banner")).toBeNull();
  });

  test("declines the challenge with a toast and shows the next one", async () => {
    setMockChallenges([challengeFrom("mock-5", "older", 20), challengeFrom("mock-2", "newer", 50)]);
    await renderHosts();

    await fireEvent.press(await screen.findByTestId("challenge-decline"));

    expect(await screen.findByText("Kira увидит «не может сейчас»")).toBeOnTheScreen();
    expect(await screen.findByText("Milo вызывает на дуэль")).toBeOnTheScreen();
  });

  test("closes a challenge that is no longer active", async () => {
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    mockServer.use(
      http.post(mockUrl("/arena/challenges/:id/accept"), () =>
        HttpResponse.json({ error: { code: "challenge_not_found" } }, { status: HTTP_NOT_FOUND }),
      ),
    );
    await renderHosts();

    await fireEvent.press(await screen.findByTestId("challenge-accept"));

    expect(await screen.findByText("Вызов уже неактуален")).toBeOnTheScreen();
    expect(screen.queryByTestId("challenge-banner")).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test("keeps the banner after an answer that may be retried", async () => {
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    mockServer.use(
      http.post(mockUrl("/arena/challenges/:id/accept"), () =>
        HttpResponse.json({ error: { code: "rival_busy" } }, { status: HTTP_CONFLICT }),
      ),
    );
    await renderHosts();

    await fireEvent.press(await screen.findByTestId("challenge-accept"));

    expect(await screen.findByText("Друг сейчас в матче — попробуй позже")).toBeOnTheScreen();
    expect(screen.getByTestId("challenge-banner")).toBeOnTheScreen();
  });

  test("opens the running match when the player is already in one", async () => {
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    mockServer.use(
      http.post(mockUrl("/arena/challenges/:id/accept"), () =>
        HttpResponse.json(
          {
            error: {
              code: "match_in_progress",
              details: { id: "match-live", kind: "duel", status: "play" },
            },
          },
          { status: HTTP_CONFLICT },
        ),
      ),
    );
    await renderHosts();

    await fireEvent.press(await screen.findByTestId("challenge-accept"));

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "match-live" },
      }),
    );
  });

  test("answers a double tap only once", async () => {
    const accepted: string[] = [];
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    mockServer.use(
      http.post(mockUrl("/arena/challenges/:id/accept"), ({ params }) => {
        accepted.push(String(params.id));
        return HttpResponse.json({ error: { code: "rival_busy" } }, { status: HTTP_CONFLICT });
      }),
    );
    await renderHosts();
    const button = await screen.findByTestId("challenge-accept");

    await act(async () => {
      fireEvent.press(button);
      fireEvent.press(button);
    });

    await waitFor(() => expect(accepted).toEqual(["challenge-in"]));
  });

  test.each([
    [["arena", "match", "[id]"]],
    [["arena", "search"]],
    [["play", "[mode]", "[id]"]],
    [["editor", "tryout"]],
  ])("is hidden on %j", async (segments) => {
    mockSegments = segments;
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    await renderHosts();
    await act(async () => undefined);

    expect(screen.queryByTestId("challenge-banner")).toBeNull();
  });

  test("is shown on the arena result", async () => {
    mockSegments = ["arena", "result", "[id]"];
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    await renderHosts();

    expect(await screen.findByTestId("challenge-banner")).toBeOnTheScreen();
  });

  test("is hidden while the arena is locked (decision 0062 #22)", async () => {
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    await renderHosts(ARENA_LEVEL - 1);
    await act(async () => undefined);

    expect(screen.queryByTestId("challenge-banner")).toBeNull();
  });

  test("is hidden offline", async () => {
    setMockChallenges([challengeFrom("mock-2", "challenge-in", 50)]);
    await renderHosts();
    await screen.findByTestId("challenge-banner");

    await act(async () => onlineManager.setOnline(false));

    expect(screen.queryByTestId("challenge-banner")).toBeNull();
  });
});
