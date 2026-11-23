import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http } from "msw/http";
import type { ReactNode } from "react";

import { useBanStore } from "@entities/app-config";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
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

  test("sends an appeal under a full ban (decision 0064 #1, 0038 #5)", async () => {
    const bodies: unknown[] = [];
    mockServer.use(
      http.post(mockUrl("/support/tickets"), async ({ request }) => {
        bodies.push(await request.clone().json());
        return undefined;
      }),
    );
    useBanStore.getState().setBan({ scope: "all", until: null, reason: "читы" });
    await render(<BannedScreen />, { wrapper: createQueryWrapper() });

    await fireEvent.press(screen.getByTestId("ban-appeal"));
    expect(screen.getByText("Опиши, что произошло")).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByTestId("support-message"), "Это не я");
    await waitFor(() => expect(screen.getByTestId("support-send")).toBeEnabled());
    await fireEvent.press(screen.getByTestId("support-send"));

    expect(await screen.findByText("Обращение отправлено")).toBeOnTheScreen();
    expect(bodies).toEqual([expect.objectContaining({ topic: "ban_appeal" })]);
  });
});
