import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl, setMockFriends } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import BlockedPlayersScreen from "./blocked-players-screen";

jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));

const HTTP_SERVER_ERROR = 500;

const renderBlocked = async () => {
  useAccountStore.getState().markSignedIn();
  await render(<BlockedPlayersScreen />, { wrapper: createQueryWrapper() });
};

describe("BlockedPlayersScreen (decision 0066 #8)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("lists the blocked players, newest first", async () => {
    setMockFriends({ blocked: ["player-7", "player-8"] });
    await renderBlocked();

    expect(await screen.findByText("Gleb")).toBeOnTheScreen();
    const rows = screen.getAllByTestId(/^blocked-player/).map((row) => row.props.testID);
    expect(rows).toEqual(["blocked-player-8", "blocked-player-7"]);
  });

  test("unblocks a player from the list", async () => {
    setMockFriends({ blocked: ["player-7"] });
    await renderBlocked();
    await screen.findByText("Miron");

    await act(async () => fireEvent.press(screen.getByTestId("blocked-unblock-player-7")));

    expect(await screen.findByText("Игрок Miron разблокирован")).toBeOnTheScreen();
    expect(await screen.findByText("Заблокированных игроков нет")).toBeOnTheScreen();
  });

  test("says there are no blocked players", async () => {
    await renderBlocked();

    expect(await screen.findByText("Заблокированных игроков нет")).toBeOnTheScreen();
  });

  test("offers to try again after an error", async () => {
    mockServer.use(
      http.get(
        mockUrl("/me/blocks"),
        () =>
          HttpResponse.json({ error: { code: "internal_error" } }, { status: HTTP_SERVER_ERROR }),
        { once: true },
      ),
    );
    await renderBlocked();

    const retry = await screen.findByTestId("blocked-retry");
    expect(screen.getByTestId("blocked-error-code")).toHaveTextContent("internal_error");
    await act(async () => fireEvent.press(retry));

    expect(await screen.findByText("Заблокированных игроков нет")).toBeOnTheScreen();
  });

  test("shows the offline bar once when there is no cache", async () => {
    await act(async () => onlineManager.setOnline(false));
    await renderBlocked();

    expect(screen.getAllByText("Нет сети")).toHaveLength(1);
  });

  test("keeps the cached list with the offline bar and unblocking off", async () => {
    setMockFriends({ blocked: ["player-7"] });
    await renderBlocked();
    await screen.findByText("Miron");

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByTestId("blocked-offline")).toHaveTextContent("Нет сети");
    await waitFor(() => expect(screen.getByTestId("blocked-unblock-player-7")).toBeDisabled());
  });
});
