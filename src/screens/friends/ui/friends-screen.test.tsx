import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { ADD_FRIEND_PARAM } from "@entities/friend";
import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { formatNumber } from "@shared/lib";
import { mockServer, mockUrl, setMockFriends } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import FriendsScreen from "./friends-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: () => true };
let mockParams: { add?: string } = {};

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
  useIsFocused: () => true,
  useNavigation: () => ({ dispatch: jest.fn(), canGoBack: () => true }),
}));
jest.mock("expo-router/react-navigation", () => ({ usePreventRemove: () => undefined }));
jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("@shared/ui/sheet/test-utils/bottom-sheet-mock"),
);
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const HTTP_SERVER_ERROR = 500;
const FRIENDS_LIMIT = 200;

const renderFriends = async () => {
  useAccountStore.getState().markSignedIn();
  await render(<FriendsScreen />, { wrapper: createQueryWrapper() });
};

const openRequests = async () => {
  await screen.findByText("Kira");
  await fireEvent.press(screen.getByTestId("friends-tab-requests"));
};

describe("FriendsScreen (decision 0062)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockParams = {};
  });

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("lists friends in the server order with trophies and status (Part 1 §7.2)", async () => {
    await renderFriends();

    expect(
      await screen.findByText(`${formatNumber(2640, "ru")} кубков · Онлайн`),
    ).toBeOnTheScreen();
    expect(screen.getByText(`${formatNumber(1450, "ru")} кубков · В матче`)).toBeOnTheScreen();
    expect(screen.getByText(`${formatNumber(3120, "ru")} кубков · Не в сети`)).toBeOnTheScreen();
    const names = screen.getAllByTestId(/^friend-mock/).map((row) => row.props.testID);
    expect(names).toEqual(["friend-mock-2", "friend-mock-5", "friend-mock-1"]);
    expect(screen.getByText("Заявки (2)")).toBeOnTheScreen();
  });

  test("invites friends from the empty list (design 24.3)", async () => {
    setMockFriends({ friends: {} });
    await renderFriends();

    expect(await screen.findByText("Играть с друзьями веселее")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("friends-invite"));

    expect(screen.getByText("Добавить друга")).toBeOnTheScreen();
  });

  test("says there are no requests on an empty requests tab", async () => {
    setMockFriends({ requests: [] });
    await renderFriends();
    await openRequests();

    expect(screen.getByTestId("friends-no-requests")).toHaveTextContent("Заявок пока нет");
  });

  test("opens the add sheet when asked by the route", async () => {
    mockParams = { add: ADD_FRIEND_PARAM };
    await renderFriends();

    expect(await screen.findByText("Добавить друга")).toBeOnTheScreen();
  });

  test("does not open the add sheet from the route offline", async () => {
    mockParams = { add: ADD_FRIEND_PARAM };
    await act(async () => onlineManager.setOnline(false));
    await renderFriends();

    expect(screen.queryByText("Добавить друга")).toBeNull();
  });

  test("accepts an incoming request (Part 1 §7.2)", async () => {
    await renderFriends();
    await openRequests();

    await act(async () => fireEvent.press(screen.getByTestId("request-accept-request-1")));

    expect(await screen.findByText("Timur теперь в друзьях")).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByTestId("request-request-1")).toBeNull());
    await fireEvent.press(screen.getByTestId("friends-tab-friends"));
    expect(await screen.findByText("Timur")).toBeOnTheScreen();
  });

  test("reports the friend limit when accepting (FRN-04)", async () => {
    const friends = Object.fromEntries(
      Array.from({ length: FRIENDS_LIMIT }, (_, index) => [`friend-${index}`, "offline" as const]),
    );
    setMockFriends({ friends: { ...friends, "mock-2": "online" } });
    await renderFriends();
    await openRequests();

    await act(async () => fireEvent.press(screen.getByTestId("request-accept-request-1")));

    expect(await screen.findByText("Достигнут лимит друзей (200)")).toBeOnTheScreen();
    expect(screen.getByTestId("request-request-1")).toBeOnTheScreen();
  });

  test("declines an incoming request", async () => {
    await renderFriends();
    await openRequests();

    await act(async () => fireEvent.press(screen.getByTestId("request-decline-request-2")));

    await waitFor(() => expect(screen.queryByTestId("request-request-2")).toBeNull());
    expect(screen.getByText("Заявки (1)")).toBeOnTheScreen();
  });

  test("withdraws a sent request (decision 0062 #9)", async () => {
    await renderFriends();
    await openRequests();
    expect(screen.getByText("Отправленные")).toBeOnTheScreen();

    await act(async () => fireEvent.press(screen.getByTestId("request-withdraw-request-3")));

    await waitFor(() => expect(screen.queryByTestId("request-request-3")).toBeNull());
    expect(screen.queryByText("Отправленные")).toBeNull();
  });

  test("removes a friend after the confirmation (decision 0062 #10)", async () => {
    await renderFriends();
    await screen.findByText("Kira");

    await fireEvent.press(screen.getByTestId("friend-more-mock-2"));
    await fireEvent.press(screen.getByTestId("friend-remove"));
    expect(screen.getByText("Удалить Kira из друзей?")).toBeOnTheScreen();
    await act(async () => fireEvent.press(screen.getByTestId("friend-remove-confirm")));

    await waitFor(() => expect(screen.queryByText("Kira")).toBeNull());
  });

  test("blocks a friend from the row menu after the confirmation (decision 0066 #17, FRN-11)", async () => {
    await renderFriends();
    await screen.findByText("Kira");

    await fireEvent.press(screen.getByTestId("friend-more-mock-2"));
    await fireEvent.press(screen.getByTestId("friend-block"));
    expect(screen.getByText("Заблокировать Kira?")).toBeOnTheScreen();
    await act(async () => fireEvent.press(screen.getByTestId("block-confirm")));

    expect(await screen.findByText("Игрок Kira заблокирован")).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByTestId("friend-mock-2")).toBeNull());
  });

  test("opens a friend's profile from his name (decision 0066 #9)", async () => {
    await renderFriends();
    await screen.findByText("Kira");

    await fireEvent.press(screen.getByLabelText("Открыть профиль Kira"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/user/[id]",
      params: { id: "mock-2" },
    });
  });

  test("keeps the cached list with the offline bar and the actions off (decision 0062 #14)", async () => {
    await renderFriends();
    await screen.findByText("Kira");

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByTestId("friends-offline")).toHaveTextContent("Нет сети");
    expect(screen.getByLabelText("Ещё, Kira")).toBeDisabled();
    expect(screen.getByText("Kira")).toBeOnTheScreen();
    expect(screen.getByTestId("friend-more-mock-2")).toBeDisabled();
    expect(screen.getByTestId("friends-add")).toBeDisabled();
    await fireEvent.press(screen.getByTestId("friends-tab-requests"));
    expect(screen.getByTestId("request-accept-request-1")).toBeDisabled();
  });

  test("shows the offline bar once when there is no cache", async () => {
    await act(async () => onlineManager.setOnline(false));
    await renderFriends();

    expect(screen.getAllByText("Нет сети")).toHaveLength(1);
  });

  test("offers to try again after an error", async () => {
    mockServer.use(
      http.get(
        mockUrl("/friends"),
        () =>
          HttpResponse.json({ error: { code: "internal_error" } }, { status: HTTP_SERVER_ERROR }),
        { once: true },
      ),
    );
    await renderFriends();

    const retry = await screen.findByTestId("friends-retry");
    expect(screen.getByTestId("friends-error-code")).toHaveTextContent("internal_error");
    await act(async () => fireEvent.press(retry));

    expect(await screen.findByText("Kira")).toBeOnTheScreen();
  });
});
