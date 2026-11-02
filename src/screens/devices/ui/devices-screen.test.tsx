import { onlineManager } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DevicesScreen from "./devices-screen";

const mockRouter = { back: jest.fn(), navigate: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));

const renderDevices = () => render(<DevicesScreen />, { wrapper: createQueryWrapper() });

describe("DevicesScreen (decision 0053 #14)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => useAccountStore.getState().markSignedIn());

  afterEach(() => {
    mockServer.reset();
    useAccountStore.getState().reset();
    mockRouter.navigate.mockClear();
    onlineManager.setOnline(true);
  });

  test("lists the devices with this one marked", async () => {
    await renderDevices();

    expect(await screen.findByText("iPhone 15")).toBeOnTheScreen();
    expect(screen.getByText("Это устройство")).toBeOnTheScreen();
    expect(screen.getByText("Pixel 8")).toBeOnTheScreen();
    expect(screen.queryByTestId("device-remove-device-1")).toBeNull();
  });

  test("signs another device out", async () => {
    await renderDevices();
    await screen.findByText("Pixel 8");

    await act(async () => fireEvent.press(screen.getByTestId("device-remove-device-2")));

    expect(await screen.findByText("Устройство отключено")).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText("Pixel 8")).toBeNull());
  });

  test("signs out everywhere after the confirmation and turns into a guest", async () => {
    await renderDevices();
    await screen.findByText("iPhone 15");

    await fireEvent.press(screen.getByTestId("devices-sign-out-all"));
    expect(screen.getByText("Выйти на всех устройствах?")).toBeOnTheScreen();
    await act(async () =>
      fireEvent.press(
        screen.getAllByText("Выйти на всех устройствах").at(-1) ??
          screen.getByTestId("devices-sign-out-all"),
      ),
    );

    await waitFor(() =>
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/settings" }),
      ),
    );
    expect(useAccountStore.getState().hasLogin).toBe(false);
  });

  test("offers to try again after an error", async () => {
    mockServer.use(
      http.get(mockUrl("/me/devices"), () =>
        HttpResponse.json({ error: { code: "route_not_found" } }, { status: 404 }),
      ),
    );
    await renderDevices();

    expect(await screen.findByTestId("devices-retry")).toBeOnTheScreen();
  });

  test("shows a skeleton while the list loads", async () => {
    await renderDevices();

    expect(
      screen.getByTestId("devices-skeleton", { includeHiddenElements: true }),
    ).toBeOnTheScreen();
  });

  test("keeps the actions off while offline", async () => {
    await renderDevices();
    await screen.findByText("Pixel 8");

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByTestId("device-remove-device-2")).toBeDisabled();
    expect(screen.getByTestId("devices-sign-out-all")).toBeDisabled();
    await act(async () => onlineManager.setOnline(true));
  });
});
