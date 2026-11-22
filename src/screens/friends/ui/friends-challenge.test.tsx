import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import type { ChallengeStatus } from "@entities/challenge";
import { i18n } from "@shared/i18n";
import {
  challengeViewMock,
  MOCK_ME_ID,
  mockServer,
  mockUrl,
  passMockLevels,
} from "@shared/test-utils/api-mock";
import { mockArenaSocket } from "@shared/test-utils/mock-arena-socket";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import FriendsScreen from "./friends-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: () => true };
const mockNavigation = { dispatch: jest.fn(), canGoBack: () => true };
const mockPreventRemove: { isPrevented: boolean; leave: () => void } = {
  isPrevented: false,
  leave: () => undefined,
};
const LEAVE_ACTION = { type: "GO_BACK" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => ({}),
  useIsFocused: () => true,
  useNavigation: () => mockNavigation,
}));
jest.mock("expo-router/react-navigation", () => ({
  usePreventRemove: (
    isPrevented: boolean,
    callback: (options: { data: { action: typeof LEAVE_ACTION } }) => void,
  ) => {
    mockPreventRemove.isPrevented = isPrevented;
    mockPreventRemove.leave = () => callback({ data: { action: LEAVE_ACTION } });
  },
}));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: true,
}));
jest.mock("@shared/ws", () => ({
  arenaSocket: jest.requireActual("@shared/test-utils/mock-arena-socket").mockArenaSocket,
}));
jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("@shared/ui/sheet/test-utils/bottom-sheet-mock"),
);
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

const ARENA_LEVEL = 12;

const renderFriends = async (passedLevels = ARENA_LEVEL) => {
  passMockLevels(passedLevels);
  useAccountStore.getState().markSignedIn();
  await render(<FriendsScreen />, { wrapper: createQueryWrapper() });
  await screen.findByText("Kira");
};

const failChallenge = (code: string, status: number, details?: Record<string, unknown>) =>
  mockServer.use(
    http.post(mockUrl("/friends/:id/challenge"), () =>
      HttpResponse.json({ error: { code, details } }, { status }),
    ),
  );

const serveArenaBan = () =>
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
        flags: { deletionScheduledAt: null, bans: [{ scope: "arena", until: null, reason: "" }] },
        consents: [],
        consentsRequired: [],
      }),
    ),
  );

const sendToKira = async () => {
  await fireEvent.press(screen.getByTestId("friend-challenge-mock-2"));
  await fireEvent.press(screen.getByTestId("challenge-send"));
  await screen.findByText("Ждём ответа");
};

const answer = (status: ChallengeStatus) =>
  act(() =>
    mockArenaSocket.push({
      type: "challenge",
      time: new Date().toISOString(),
      challenge: { id: "challenge-1", status },
    }),
  );

describe("Friend challenge (decision 0062 round 2)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.push.mockClear());

  afterEach(async () => {
    jest.useRealTimers();
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
  });

  test("opens the sheet with the friendly line and the league format (design 24.4)", async () => {
    await renderFriends();

    await fireEvent.press(screen.getByTestId("friend-challenge-mock-2"));

    expect(screen.getByText("Вызов · Kira")).toBeOnTheScreen();
    expect(screen.getByText("дружеский матч — кубки не меняются")).toBeOnTheScreen();
    expect(await screen.findByTestId("challenge-format")).toHaveTextContent(
      "6×6 · 1 цели · 10 с на ход",
    );
  });

  test("sends the challenge and waits for the answer (design 24.5)", async () => {
    await renderFriends();

    await sendToKira();

    expect(screen.getByText(/^ждём Kira · 6×6 · до \d+ с$/)).toBeOnTheScreen();
    expect(screen.queryByText("Вызов · Kira")).toBeNull();
  });

  test("cancels the waiting challenge on the server", async () => {
    const cancelled: string[] = [];
    mockServer.use(
      http.delete(mockUrl("/arena/challenges/:id"), ({ params }) => {
        cancelled.push(String(params.id));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderFriends();
    await sendToKira();

    await fireEvent.press(screen.getByTestId("challenge-cancel"));

    expect(screen.queryByText("Ждём ответа")).toBeNull();
    await waitFor(() => expect(cancelled).toEqual(["challenge-1"]));
  });

  test("tells the challenger the friend cannot play now (decision 0062 #19)", async () => {
    await renderFriends();
    await sendToKira();

    await answer("declined");

    expect(screen.queryByText("Ждём ответа")).toBeNull();
    expect(screen.getByText("Kira не может сейчас")).toBeOnTheScreen();
  });

  test("tells the challenger there was no answer (FRN-09)", async () => {
    await renderFriends();
    await sendToKira();

    await answer("expired");

    expect(screen.getByText("Нет ответа от Kira")).toBeOnTheScreen();
  });

  test("cancels the challenge when the player leaves the screen, then leaves (decision 0062 #20)", async () => {
    const cancelled: string[] = [];
    mockServer.use(
      http.delete(mockUrl("/arena/challenges/:id"), ({ params }) => {
        cancelled.push(String(params.id));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderFriends();
    await sendToKira();
    expect(mockPreventRemove.isPrevented).toBe(true);

    await act(() => mockPreventRemove.leave());

    expect(screen.queryByText("Ждём ответа")).toBeNull();
    expect(mockNavigation.dispatch).toHaveBeenCalledWith(LEAVE_ACTION);
    await waitFor(() => expect(cancelled).toEqual(["challenge-1"]));
    expect(mockPreventRemove.isPrevented).toBe(false);
  });

  test("waits for the server's expiry push a little past the deadline", async () => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate", "queueMicrotask"] });
    const sent = { expiresAt: 0 };
    mockServer.use(
      http.post(mockUrl("/friends/:id/challenge"), () => {
        sent.expiresAt = Date.now() + 10_000;
        return HttpResponse.json(
          challengeViewMock({
            id: "challenge-1",
            from: MOCK_ME_ID,
            to: "mock-2",
            status: "pending",
            expiresAt: new Date(sent.expiresAt).toISOString(),
          }),
        );
      }),
    );
    await renderFriends();
    await sendToKira();

    await act(() => jest.advanceTimersByTime(sent.expiresAt - Date.now() + 1_000));
    expect(screen.getByText("Ждём ответа")).toBeOnTheScreen();

    // The Date header keeps whole seconds, so the server clock may lag the phone by up to a second (заголовок Date хранит целые секунды, поэтому серверные часы могут отставать от телефона до секунды).
    await act(() => jest.advanceTimersByTime(2_500));
    expect(screen.getByText("Нет ответа от Kira")).toBeOnTheScreen();
  });

  test("disables the challenge for a friend in a match (decision 0062 #6)", async () => {
    await renderFriends();

    expect(screen.getByTestId("friend-challenge-mock-5")).toBeDisabled();
    expect(screen.getByTestId("friend-challenge-mock-2")).toBeEnabled();
  });

  test("shows the server's busy friend as a toast", async () => {
    failChallenge("rival_busy", HTTP_CONFLICT);
    await renderFriends();

    await fireEvent.press(screen.getByTestId("friend-challenge-mock-2"));
    await fireEvent.press(screen.getByTestId("challenge-send"));

    expect(await screen.findByText("Друг сейчас в матче — попробуй позже")).toBeOnTheScreen();
    expect(screen.queryByText("Ждём ответа")).toBeNull();
  });

  test("opens the running match instead of a new challenge", async () => {
    failChallenge("match_in_progress", HTTP_CONFLICT, {
      id: "match-live",
      kind: "duel",
      status: "play",
    });
    await renderFriends();

    await fireEvent.press(screen.getByTestId("friend-challenge-mock-2"));
    await fireEvent.press(screen.getByTestId("challenge-send"));

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/match/[id]",
        params: { id: "match-live" },
      }),
    );
  });

  test("shows the unlock level of a locked arena from the server's answer", async () => {
    failChallenge("arena_locked", HTTP_FORBIDDEN, { level: 12 });
    await renderFriends();

    await fireEvent.press(screen.getByTestId("friend-challenge-mock-2"));
    await fireEvent.press(screen.getByTestId("challenge-send"));

    expect(await screen.findByText("Арена откроется после уровня 12")).toBeOnTheScreen();
  });

  test("keeps the challenge disabled with a locked arena and explains why (decision 0062 #22)", async () => {
    await renderFriends(ARENA_LEVEL - 1);
    await waitFor(() => expect(screen.getByTestId("friend-challenge-mock-2")).toBeDisabled());

    await fireEvent.press(screen.getByTestId("friend-challenge-mock-2"));

    expect(screen.getByText("Арена откроется после уровня 12")).toBeOnTheScreen();
    expect(screen.queryByText("Вызов · Kira")).toBeNull();
  });

  test("explains the arena ban instead of opening the sheet", async () => {
    serveArenaBan();
    await renderFriends();
    await waitFor(() => expect(screen.getByTestId("friend-challenge-mock-2")).toBeDisabled());

    await fireEvent.press(screen.getByTestId("friend-challenge-mock-2"));

    expect(screen.getByText("Арена для тебя закрыта")).toBeOnTheScreen();
  });
});
