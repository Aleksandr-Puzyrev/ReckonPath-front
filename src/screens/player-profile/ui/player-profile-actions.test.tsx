import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer, passMockLevels, setMockFriends } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import PlayerProfileScreen from "./player-profile-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: () => true };
let mockParams = { id: "player-7" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
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
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const ARENA_LEVEL = 12;

const renderProfile = async (id: string, name: string) => {
  mockParams = { id };
  passMockLevels(ARENA_LEVEL);
  useAccountStore.getState().markSignedIn();
  await render(<PlayerProfileScreen />, { wrapper: createQueryWrapper() });
  await screen.findByText(name);
};

const chooseInMenu = async (testID: string) => {
  await fireEvent.press(screen.getByLabelText("Ещё"));
  await fireEvent.press(screen.getByTestId(testID));
};

describe("PlayerProfileScreen actions (decision 0066 #3, #6–#8, #11)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
  });

  test("sends a friend request to a stranger and shows it sent with the hint", async () => {
    await renderProfile("player-7", "Miron");

    await act(async () => fireEvent.press(await screen.findByTestId("player-add")));

    expect(await screen.findByTestId("player-sent")).toHaveTextContent("Заявка отправлена");
    expect(screen.getByTestId("player-sent")).toBeDisabled();
    expect(screen.getByTestId("player-hint")).toHaveTextContent(
      "Miron увидит заявку в «Друзья → Заявки»",
    );
  });

  test("shows an outgoing request as sent", async () => {
    await renderProfile("player-6", "Mila");

    expect(await screen.findByTestId("player-sent")).toBeDisabled();
  });

  test("accepts an incoming request and offers the challenge", async () => {
    await renderProfile("player-4", "Timur");

    await act(async () => fireEvent.press(await screen.findByTestId("player-accept")));

    expect(await screen.findByText("Timur теперь в друзьях")).toBeOnTheScreen();
    expect(await screen.findByTestId("player-challenge")).toHaveTextContent("Вызвать на дуэль");
  });

  test("challenges an online friend to a friendly duel (decision 0066 #12)", async () => {
    await renderProfile("mock-2", "Kira");

    expect(await screen.findByTestId("player-hint")).toHaveTextContent(
      "Kira в сети · дружеский матч без кубков",
    );
    await fireEvent.press(screen.getByTestId("player-challenge"));

    expect(await screen.findByText("Вызов · Kira")).toBeOnTheScreen();
  });

  test("names a friendly match for an offline friend", async () => {
    await renderProfile("mock-1", "Nova");

    expect(await screen.findByTestId("player-hint")).toHaveTextContent("Дружеский матч без кубков");
  });

  test("keeps the challenge off while the arena is locked (decision 0062 #22)", async () => {
    mockParams = { id: "mock-2" };
    passMockLevels(1);
    useAccountStore.getState().markSignedIn();
    await render(<PlayerProfileScreen />, { wrapper: createQueryWrapper() });

    await waitFor(() => expect(screen.getByTestId("player-challenge")).toBeDisabled());
  });

  test("shows a blocked player without the head to head and unblocks him", async () => {
    setMockFriends({ blocked: ["player-7"] });
    await renderProfile("player-7", "Miron");

    expect(screen.getByTestId("player-hint")).toHaveTextContent("Игрок заблокирован");
    expect(screen.queryByTestId("player-head-to-head")).toBeNull();
    await act(async () => fireEvent.press(screen.getByTestId("player-unblock")));

    expect(await screen.findByText("Игрок Miron разблокирован")).toBeOnTheScreen();
    expect(await screen.findByTestId("player-add")).toBeOnTheScreen();
  });

  test("blocks the player after the confirmation and refreshes the profile (FRN-11)", async () => {
    await renderProfile("mock-2", "Kira");

    await chooseInMenu("player-block");
    expect(screen.getByText("Заблокировать Kira?")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Дружба и заявки удалятся. Вы не сможете найти друг друга и вызвать на дуэль.",
      ),
    ).toBeOnTheScreen();
    await act(async () => fireEvent.press(screen.getByTestId("block-confirm")));

    expect(await screen.findByText("Игрок Kira заблокирован")).toBeOnTheScreen();
    expect(await screen.findByTestId("player-unblock")).toBeOnTheScreen();
    expect(screen.queryByTestId("player-challenge")).toBeNull();
  });

  test("reports the player for either reason (decision 0066 #7)", async () => {
    await renderProfile("player-7", "Miron");

    await chooseInMenu("player-report");
    expect(screen.getByText("Пожаловаться на Miron")).toBeOnTheScreen();
    expect(screen.getByTestId("report-nickname")).toHaveTextContent("Оскорбительный ник");
    await act(async () => fireEvent.press(screen.getByTestId("report-cheating")));

    expect(await screen.findByText("Жалоба отправлена")).toBeOnTheScreen();
  });

  test("offers to remove only a friend", async () => {
    await renderProfile("player-7", "Miron");
    await fireEvent.press(screen.getByLabelText("Ещё"));
    expect(screen.queryByTestId("player-remove")).toBeNull();
    await cleanup();

    await renderProfile("mock-2", "Kira");
    await chooseInMenu("player-remove");
    await act(async () => fireEvent.press(screen.getByTestId("friend-remove-confirm")));

    expect(await screen.findByTestId("player-add")).toBeOnTheScreen();
  });
});
