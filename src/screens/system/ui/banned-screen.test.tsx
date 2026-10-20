import { cleanup, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useBanStore } from "@entities/app-config";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import BannedScreen from "./banned-screen";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

describe("BannedScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    useBanStore.getState().reset();
    mockServer.reset();
  });

  test("shows a full ban with an appeal and no way to the campaign (decision 0038 #7)", async () => {
    useBanStore.getState().setBan({ scope: "all", until: null, reason: "читы" });

    await render(<BannedScreen />, { wrapper: createQueryWrapper() });

    expect(screen.getByText("Доступ ограничен")).toBeOnTheScreen();
    expect(screen.getByText(/Причина: читы\. Навсегда/)).toBeOnTheScreen();
    expect(screen.getByTestId("ban-appeal")).toBeOnTheScreen();
    expect(screen.queryByTestId("ban-campaign")).toBeNull();
  });
});
