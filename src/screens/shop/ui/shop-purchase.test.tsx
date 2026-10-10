import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ShopScreen from "./shop-screen";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardPreview: () => null, BoardTryout: () => null }));

const renderShop = async () => {
  await render(<ShopScreen />, { wrapper: createQueryWrapper() });
  await screen.findByText("Ночной сигнал");
};

const openTab = (label: string) => fireEvent.press(screen.getByRole("tab", { name: label }));

const openCard = (name: string) => fireEvent.press(screen.getByLabelText(new RegExp(`^${name},`)));

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

const emeralds = async () => (await apiClient.GET("/me")).data?.wallet.emeralds;

describe("Shop purchase", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => useAccountStore.getState().markSignedIn());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("opens the preview of a tapped card", async () => {
    await renderShop();
    await openTab("Поля");

    await openCard("Коралловый риф");

    expect(screen.getByText("Бирюзовая вода, коралл и тёплый песок.")).toBeOnTheScreen();
    expect(screen.getByTestId("preview-buy")).toBeOnTheScreen();
  });

  test("buys after the confirmation from ◆ 500 and offers to equip (SHP-01)", async () => {
    await renderShop();
    await openCard("Ночной сигнал");

    await fireEvent.press(screen.getByTestId("preview-buy"));
    expect(screen.getByText(/^Купить «Ночной сигнал» за/)).toBeOnTheScreen();
    await act(async () => fireEvent.press(screen.getByText("Купить")));

    expect(await screen.findByText("Покупка прошла")).toBeOnTheScreen();
    expect(screen.getByTestId("success-equip")).toBeOnTheScreen();
    expect(await emeralds()).toBe(960);
  });

  test("equips a bought item and marks its card (decision 0023 #5)", async () => {
    await renderShop();
    await openTab("Поля");
    await openCard("Коралловый риф");
    await act(async () => fireEvent.press(screen.getByTestId("preview-buy")));
    await screen.findByText("Покупка прошла");

    await act(async () => fireEvent.press(screen.getByTestId("success-equip")));

    expect(await screen.findByText("Экипировано: Коралловый риф")).toBeOnTheScreen();
    await waitFor(() =>
      expect(screen.getByLabelText(/^Коралловый риф, .*Надето$/)).toBeOnTheScreen(),
    );
  });

  test("makes one purchase on a double tap (SHP-04)", async () => {
    await renderShop();
    await openTab("Поля");
    await openCard("Коралловый риф");

    const button = screen.getByTestId("preview-buy");
    await fireEvent.press(button);
    await fireEvent.press(button);
    await screen.findByText("Покупка прошла");

    expect(await emeralds()).toBe(2160);
  });

  test("opens the ways to earn when emeralds are short (SHP-02)", async () => {
    mockServer.use(
      http.get(mockUrl("/me"), () => HttpResponse.json({ wallet: { emeralds: 100, coins: 0 } })),
    );
    await renderShop();
    await openTab("Поля");
    await openCard("Коралловый риф");
    await settle();

    await fireEvent.press(screen.getByTestId("preview-buy"));

    expect(screen.getByText("Не хватает")).toBeOnTheScreen();
    expect(screen.getByText("380")).toBeOnTheScreen();
  });

  test("disables the purchase offline (decision 0023 #13)", async () => {
    await renderShop();
    await act(async () => onlineManager.setOnline(false));

    await openCard("Ночной сигнал");

    expect(screen.getByTestId("preview-buy")).toBeDisabled();
    expect(screen.getByLabelText(/Нужен интернет/)).toBeOnTheScreen();
  });

  test("lists the bundle parts with the owned ones and the struck base price (SHP-08)", async () => {
    await apiClient.POST("/shop/purchase", {
      body: { itemId: "garden", expectedPrice: { emeralds: 520 } },
    });
    await renderShop();
    await openTab("Наборы");

    await openCard("Набор «Сад»");

    expect(screen.getByText("Сад на закате")).toBeOnTheScreen();
    expect(screen.getByText("Золотой маркер")).toBeOnTheScreen();
    expect(screen.getByText("Уже есть")).toBeOnTheScreen();
    expect(screen.getByText("900")).toBeOnTheScreen();
  });

  test("shows a complete bundle without a purchase (SHP-09)", async () => {
    await apiClient.POST("/shop/purchase", {
      body: { bundleId: "set_garden", expectedPrice: { emeralds: 560 } },
    });
    await renderShop();
    await openTab("Наборы");

    await openCard("Набор «Сад»");

    expect(screen.queryByTestId("preview-buy")).toBeNull();
    expect(screen.getAllByText("Собрано").length).toBeGreaterThan(0);
  });

  test("explains an ended offer and closes the preview (SHP-06)", async () => {
    mockServer.use(
      http.post(mockUrl("/shop/purchase"), () =>
        HttpResponse.json({ error: { code: "OFFER_ENDED" } }, { status: 422 }),
      ),
    );
    await renderShop();
    await openTab("Поля");
    await openCard("Коралловый риф");

    await act(async () => fireEvent.press(screen.getByTestId("preview-buy")));
    expect(await screen.findByText("Предложение завершено")).toBeOnTheScreen();
    await act(async () => fireEvent.press(screen.getByText("Понятно")));

    expect(screen.queryByTestId("preview-buy")).toBeNull();
  });

  test("says the last copy is gone and closes the preview (SHP-07)", async () => {
    mockServer.use(
      http.post(mockUrl("/shop/purchase"), () =>
        HttpResponse.json({ error: { code: "SOLD_OUT" } }, { status: 422 }),
      ),
    );
    await renderShop();
    await openTab("Поля");
    await openCard("Коралловый риф");

    await act(async () => fireEvent.press(screen.getByTestId("preview-buy")));
    expect(await screen.findByText("Тираж раскуплен")).toBeOnTheScreen();
    await act(async () => fireEvent.press(screen.getByText("Понятно")));

    expect(screen.queryByTestId("preview-buy")).toBeNull();
  });

  test("disables equip offline (decision 0023 #20)", async () => {
    await apiClient.POST("/shop/purchase", {
      body: { itemId: "reef", expectedPrice: { emeralds: 480 } },
    });
    await renderShop();
    await act(async () => onlineManager.setOnline(false));
    await openTab("Поля");

    await openCard("Коралловый риф");

    expect(screen.getByTestId("preview-equip")).toBeDisabled();
  });

  test("switches the preview between the skin's themes (decision 0024 #8)", async () => {
    await renderShop();
    await openTab("Поля");
    await openCard("Коралловый риф");

    await fireEvent.press(screen.getByRole("radio", { name: "Светлая" }));

    expect(screen.getByRole("radio", { name: "Светлая" })).toBeSelected();
    expect(screen.getByRole("radio", { name: "Тёмная" })).not.toBeSelected();
  });
});
