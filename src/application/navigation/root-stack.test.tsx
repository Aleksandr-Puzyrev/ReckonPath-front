import { screen } from "@testing-library/react-native";
import { Slot } from "expo-router";
import { renderRouter } from "expo-router/testing-library";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";
import { Text } from "react-native";

import { useSystemNoticeStore } from "@entities/app-config";
import { bootstrapMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import RootStack from "./root-stack";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const serveBootstrap = (overrides: Partial<ReturnType<typeof bootstrapMock>>) =>
  mockServer.use(
    http.get(mockUrl("/bootstrap"), () => HttpResponse.json({ ...bootstrapMock(), ...overrides })),
  );

const versions = (min: string, recommended: string) => ({
  version: { min, recommended, storeUrl: "https://apps.apple.com/app/id000" },
});

const renderApp = () => {
  const QueryWrapper = createQueryWrapper();
  return renderRouter({
    _layout: () => (
      <QueryWrapper>
        <RootStack />
      </QueryWrapper>
    ),
    "(tabs)/_layout": () => <Slot />,
    "(tabs)/index": () => <Text>home</Text>,
    "play/[mode]/[id]": () => <Text>play</Text>,
    "system/update": () => <Text>update</Text>,
    "system/maintenance": () => <Text>maintenance</Text>,
  });
};

describe("RootStack", () => {
  beforeEach(() => useSystemNoticeStore.getState().reset());

  afterEach(() => mockServer.reset());

  test("opens the app on the current version", async () => {
    await renderApp();

    expect(await screen.findByText("home")).toBeOnTheScreen();
  });

  test("locks the app on the update screen below the minimum version (NET-01)", async () => {
    serveBootstrap(versions("99.0.0", "99.0.0"));

    await renderApp();

    expect(await screen.findByText("update")).toBeOnTheScreen();
    expect(screen.queryByText("home")).not.toBeOnTheScreen();
  });

  test("shows maintenance from the bootstrap (NET-04)", async () => {
    serveBootstrap({ maintenance: { message: "Arena servers" } });

    await renderApp();

    expect(await screen.findByText("maintenance")).toBeOnTheScreen();
  });

  test("opens the app after maintenance was dismissed", async () => {
    serveBootstrap({ maintenance: { message: "Arena servers" } });
    useSystemNoticeStore.getState().dismissMaintenance();

    await renderApp();

    expect(await screen.findByText("home")).toBeOnTheScreen();
  });

  test("puts the update screen before maintenance", async () => {
    serveBootstrap({ ...versions("99.0.0", "99.0.0"), maintenance: { message: "Arena" } });

    await renderApp();

    expect(await screen.findByText("update")).toBeOnTheScreen();
  });

  test("offers the soft update over the app (NET-02)", async () => {
    serveBootstrap(versions("1.0.0", "99.0.0"));

    await renderApp();

    expect(await screen.findByText(/99\.0\.0/)).toBeOnTheScreen();
    expect(screen.getByText("home")).toBeOnTheScreen();
  });

  test("does not offer the soft update again on the day of «Позже» (NET-02)", async () => {
    serveBootstrap(versions("1.0.0", "99.0.0"));
    useSystemNoticeStore.getState().dismissSoftUpdate();

    await renderApp();

    expect(await screen.findByText("home")).toBeOnTheScreen();
    expect(screen.queryByText(/99\.0\.0/)).not.toBeOnTheScreen();
  });
});
