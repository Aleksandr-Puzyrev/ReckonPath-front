import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ProfileScreen from "./profile-screen";

const mockRouter = { push: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardTryout: () => null }));

const renderProfile = async () => {
  await render(<ProfileScreen />, { wrapper: createQueryWrapper() });
  await screen.findByText("Player4821");
};

const buyReef = async () => {
  await apiClient.POST("/shop/purchase", {
    body: { itemId: "reef", expectedPrice: { emeralds: 480 } },
  });
};

describe("ProfileScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.push.mockClear());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("shows a guest's level and experience", async () => {
    await renderProfile();

    expect(screen.getByText("Уровень 1 · гость")).toBeOnTheScreen();
    expect(screen.getByText("XP 0 / 100")).toBeOnTheScreen();
  });

  test("leads a guest to the sign-up and sign-in forms (decision 0024 #4)", async () => {
    await renderProfile();

    await fireEvent.press(screen.getByTestId("guest-sign-up"));
    await fireEvent.press(screen.getByTestId("guest-sign-in"));

    expect(mockRouter.push).toHaveBeenNthCalledWith(1, "/account/sign-up");
    expect(mockRouter.push).toHaveBeenNthCalledWith(2, "/account/sign-in");
  });

  test("shows no guest card for an account with a login", async () => {
    mockServer.use(
      http.get(mockUrl("/me"), () =>
        HttpResponse.json({
          nickname: "Nova_58",
          isGuest: false,
          level: 58,
          xp: 340,
          xpToNext: 475,
          wallet: { emeralds: 0, coins: 0 },
          loadout: {},
        }),
      ),
    );
    await render(<ProfileScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText("Уровень 58")).toBeOnTheScreen();
    expect(screen.queryByTestId("guest-sign-up")).toBeNull();
  });

  test("shows eleven collection slots with the default items (decision 0024 #6)", async () => {
    await renderProfile();

    expect(screen.getAllByRole("button", { name: /: По умолчанию$/ })).toHaveLength(11);
    expect(screen.queryByText("FX")).toBeNull();
  });

  test("equips an owned item from the slot sheet", async () => {
    await buyReef();
    await renderProfile();

    await fireEvent.press(screen.getByTestId("collection-field"));
    await act(async () => fireEvent.press(await screen.findByTestId("slot-reef")));

    expect(await screen.findByText("Экипировано: Коралловый риф")).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByLabelText("Поле: Коралловый риф")).toBeOnTheScreen());
  });

  test("puts the default item back", async () => {
    await buyReef();
    await apiClient.PUT("/loadout", { body: { field: "reef" } });
    await renderProfile();
    await screen.findByLabelText("Поле: Коралловый риф");

    await fireEvent.press(screen.getByTestId("collection-field"));
    await act(async () => fireEvent.press(screen.getByTestId("slot-default")));

    await waitFor(() => expect(screen.getByLabelText("Поле: По умолчанию")).toBeOnTheScreen());
  });

  test("disables the choice offline", async () => {
    await buyReef();
    await renderProfile();
    await act(async () => onlineManager.setOnline(false));

    await fireEvent.press(screen.getByTestId("collection-field"));

    expect(await screen.findByTestId("slot-reef")).toBeDisabled();
    expect(screen.getByText("Нужен интернет")).toBeOnTheScreen();
  });

  test("opens the shop from the slot sheet", async () => {
    await renderProfile();
    await fireEvent.press(screen.getByTestId("collection-field"));

    await fireEvent.press(screen.getByRole("button", { name: "Ещё в витрине" }));

    expect(mockRouter.push).toHaveBeenCalledWith("/shop");
  });

  test("shows a skeleton while the player's data loads", async () => {
    await render(<ProfileScreen />, { wrapper: createQueryWrapper() });

    expect(
      screen.getByTestId("profile-skeleton", { includeHiddenElements: true }),
    ).toBeOnTheScreen();
    await screen.findByText("Player4821");
  });
});
