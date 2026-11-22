import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { FriendsScreen } from "@screens/friends";
import { useMatchStore } from "@entities/match";
import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import {
  matchViewMock,
  mockServer,
  passMockLevels,
  setMockChallenges,
  setMockMatch,
} from "@shared/test-utils/api-mock";
import { mockArenaSocket } from "@shared/test-utils/mock-arena-socket";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaSocketHost from "./arena-socket-host";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: () => true };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => ({}),
  useIsFocused: () => true,
  useSegments: () => ["friends"],
  useNavigation: () => ({ dispatch: jest.fn(), canGoBack: () => true }),
}));
jest.mock("expo-router/react-navigation", () => ({ usePreventRemove: () => undefined }));
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

const ARENA_LEVEL = 12;
const FRIENDLY = matchViewMock({ id: "match-friendly", friendly: true });
const OPENED_MATCH = { pathname: "/arena/match/[id]", params: { id: "match-friendly" } };

const waitForKira = async () => {
  passMockLevels(ARENA_LEVEL);
  useAccountStore.getState().markSignedIn();
  await render(
    <>
      <FriendsScreen />
      <ArenaSocketHost />
    </>,
    { wrapper: createQueryWrapper() },
  );
  await waitFor(() => expect(mockArenaSocket.isOpen).toBe(true));
  await fireEvent.press(await screen.findByTestId("friend-challenge-mock-2"));
  await fireEvent.press(screen.getByTestId("challenge-send"));
  await screen.findByText("Ждём ответа");
};

const expectQuietClose = () => {
  expect(screen.queryByText("Ждём ответа")).toBeNull();
  expect(screen.queryByText("Нет ответа от Kira")).toBeNull();
  expect(screen.queryByText("Kira не может сейчас")).toBeNull();
};

describe("Friend challenge from the challenger's side (decision 0062 #20)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.push.mockClear());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    useMatchStore.getState().reset();
  });

  test("closes the waiting on «accepted» and opens the match from its push", async () => {
    await waitForKira();

    await act(() =>
      mockArenaSocket.push({
        type: "challenge",
        time: new Date().toISOString(),
        challenge: { id: "challenge-1", status: "accepted" },
      }),
    );
    expectQuietClose();
    await act(() =>
      mockArenaSocket.push({ type: "match", time: new Date().toISOString(), match: FRIENDLY }),
    );

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith(OPENED_MATCH));
  });

  test("closes the waiting when only the match push arrives", async () => {
    await waitForKira();

    await act(() =>
      mockArenaSocket.push({ type: "match", time: new Date().toISOString(), match: FRIENDLY }),
    );

    expectQuietClose();
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith(OPENED_MATCH));
  });

  test("finds the accepted challenge's match after a reconnect", async () => {
    await waitForKira();
    setMockChallenges([]);
    setMockMatch(FRIENDLY);

    await act(() => mockArenaSocket.reconnect());

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith(OPENED_MATCH));
    expectQuietClose();
  });

  test("keeps waiting after a reconnect while the challenge still waits", async () => {
    await waitForKira();

    await act(() => mockArenaSocket.reconnect());
    await act(async () => undefined);

    expect(screen.getByText("Ждём ответа")).toBeOnTheScreen();
  });
});
