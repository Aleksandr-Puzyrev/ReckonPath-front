import { act, cleanup, renderHook, waitFor } from "@testing-library/react-native";

import { useDailyLeaderboardQuery } from "@entities/daily";
import { usePlayerProfileQuery } from "@entities/player";
import { useAccountStore } from "@entities/session";
import { MOCK_ME_ID, mockServer, setMockFriends } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useAnswerFriendRequest } from "./use-answer-friend-request";

const CREATED_AT = "2026-11-16T10:00:00.000Z";
const REQUEST = {
  id: "request-nova",
  user: { id: "mock-1", name: "Nova", trophies: 3120, league: "platinum" },
  createdAt: CREATED_AT,
};

describe("useAnswerFriendRequest", () => {
  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
  });

  test("refreshes the friends top of the day after accepting (decision 0062 #12)", async () => {
    useAccountStore.getState().markSignedIn();
    setMockFriends({
      friends: {},
      requests: [{ id: REQUEST.id, from: REQUEST.user.id, to: MOCK_ME_ID, createdAt: CREATED_AT }],
    });
    const onAccepted = jest.fn();
    const { result } = await renderHook(
      () => ({
        board: useDailyLeaderboardQuery("friends"),
        answer: useAnswerFriendRequest({ onAccepted, onError: jest.fn() }),
      }),
      { wrapper: createQueryWrapper() },
    );
    await waitFor(() => expect(result.current.board.data?.entries).toEqual([]));

    await act(async () => result.current.answer.accept(REQUEST));

    await waitFor(() =>
      expect(result.current.board.data?.entries.map(({ name }) => name)).toEqual(["Nova"]),
    );
    expect(onAccepted).toHaveBeenCalledWith("Nova");
  });

  test("refreshes the player's profile with the new relation (decision 0066 #11)", async () => {
    useAccountStore.getState().markSignedIn();
    setMockFriends({
      friends: {},
      requests: [{ id: REQUEST.id, from: REQUEST.user.id, to: MOCK_ME_ID, createdAt: CREATED_AT }],
    });
    const { result } = await renderHook(
      () => ({
        profile: usePlayerProfileQuery(REQUEST.user.id),
        answer: useAnswerFriendRequest({ onAccepted: jest.fn(), onError: jest.fn() }),
      }),
      { wrapper: createQueryWrapper() },
    );
    await waitFor(() => expect(result.current.profile.data?.relation).toBe("incoming"));

    await act(async () => result.current.answer.decline(REQUEST));

    await waitFor(() => expect(result.current.profile.data?.relation).toBe("none"));
  });
});
