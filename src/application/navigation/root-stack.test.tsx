import { act, screen } from "@testing-library/react-native";
import { Slot } from "expo-router";
import { renderRouter } from "expo-router/testing-library";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";
import { Text } from "react-native";

import { useBanStore, useSystemNoticeStore } from "@entities/app-config";
import { useInterstitialStore } from "@entities/ad";
import { useAccountStore } from "@entities/session";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { maintenanceMock, mockServer, mockUrl, versionMock } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import RootStack from "./root-stack";

jest.mock("../splash/splash-gate", () => () => null);
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const serveVersion = (overrides: Parameters<typeof versionMock>[0]) =>
  mockServer.use(
    http.get(mockUrl("/version"), () =>
      HttpResponse.json(
        versionMock({ appStore: "https://apps.apple.com/app/id000", ...overrides }),
      ),
    ),
  );

const serveMaintenance = () =>
  mockServer.use(
    http.get(mockUrl("/maintenance"), () =>
      HttpResponse.json(maintenanceMock({ active: false, message: "Arena servers" })),
    ),
  );

const FORCED = { forceUpdate: true };
const SOFT = { showModal: true, currentVersion: "99.0.0" };

const renderApp = (options: Parameters<typeof renderRouter>[1] = {}) => {
  const QueryWrapper = createQueryWrapper();
  return renderRouter(
    {
      _layout: () => (
        <QueryWrapper>
          <RootStack />
        </QueryWrapper>
      ),
      "(tabs)/_layout": () => <Slot />,
      "(tabs)/index": () => <Text>home</Text>,
      "play/[mode]/[id]": () => <Text>play</Text>,
      "account/sign-in": () => <Text>sign-in</Text>,
      "account/sign-up": () => <Text>sign-up</Text>,
      daily: () => <Text>daily</Text>,
      "system/update": () => <Text>update</Text>,
      "system/maintenance": () => <Text>maintenance</Text>,
      "system/banned": () => <Text>banned</Text>,
    },
    options,
  );
};

describe("RootStack", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    useSystemNoticeStore.getState().reset();
    useAccountStore.getState().reset();
    useBanStore.getState().reset();
  });

  afterEach(() => mockServer.reset());

  test("shows a queued link offer on the tabs", async () => {
    useAccountStore.getState().requestLevelOffer();

    await renderApp();

    expect(await screen.findByText("Сохрани прогресс")).toBeOnTheScreen();
  });

  test("keeps a queued link offer away from a game", async () => {
    useAccountStore.getState().requestLevelOffer();

    await renderApp({ initialUrl: "/play/campaign/c-1" });

    expect(await screen.findByText("play")).toBeOnTheScreen();
    expect(screen.queryByText("Сохрани прогресс")).toBeNull();
  });

  test("remembers the first launch for the quiet first session", async () => {
    useInterstitialStore.getState().reset();

    await renderApp();

    expect(await screen.findByText("home")).toBeOnTheScreen();
    expect(useInterstitialStore.getState().firstLaunchAt).not.toBeNull();
  });

  test("opens the app on the current version", async () => {
    await renderApp();

    expect(await screen.findByText("home")).toBeOnTheScreen();
  });

  test("locks the app on the update screen when the backend forces it (NET-01)", async () => {
    serveVersion(FORCED);

    await renderApp();

    expect(await screen.findByText("update")).toBeOnTheScreen();
    expect(screen.queryByText("home")).not.toBeOnTheScreen();
  });

  test("shows maintenance when the backend says the app does not work (NET-04)", async () => {
    serveMaintenance();

    await renderApp();

    expect(await screen.findByText("maintenance")).toBeOnTheScreen();
  });

  test("locks the app on the ban screen after a full ban from any request (decision 0038 #7)", async () => {
    useAccountStore.getState().markSignedIn();
    mockServer.use(
      http.get(mockUrl("/me"), () =>
        HttpResponse.json(
          { error: { code: "banned", details: { scope: "all", until: null, reason: "Cheating" } } },
          { status: 403 },
        ),
      ),
    );

    await renderApp();
    await act(async () => {
      await apiClient.GET("/me");
    });

    expect(await screen.findByText("banned")).toBeOnTheScreen();
    expect(screen.queryByText("home")).not.toBeOnTheScreen();
  });

  test("opens the app after maintenance was dismissed", async () => {
    serveMaintenance();
    useSystemNoticeStore.getState().dismissMaintenance();

    await renderApp();

    expect(await screen.findByText("home")).toBeOnTheScreen();
  });

  test("puts the update screen before maintenance", async () => {
    serveVersion(FORCED);
    serveMaintenance();

    await renderApp();

    expect(await screen.findByText("update")).toBeOnTheScreen();
  });

  test("offers the soft update over the app (NET-02)", async () => {
    serveVersion(SOFT);

    await renderApp();

    expect(await screen.findByText(/99\.0\.0/)).toBeOnTheScreen();
    expect(screen.getByText("home")).toBeOnTheScreen();
  });

  test("does not offer the soft update again on the day of «Позже» (NET-02)", async () => {
    serveVersion(SOFT);
    useSystemNoticeStore.getState().dismissSoftUpdate();

    await renderApp();

    expect(await screen.findByText("home")).toBeOnTheScreen();
    expect(screen.queryByText(/99\.0\.0/)).not.toBeOnTheScreen();
  });
});
