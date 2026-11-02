import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { buyMockItem } from "@shared/test-utils/buy-mock-item";
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

const emeralds = async () => (await apiClient.GET("/wallet")).data?.gems;

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

  test("shows an error when the first bundle part is not in the shop (decision 0055 #10)", async () => {
    mockServer.use(
      http.get(mockUrl("/shop"), () =>
        HttpResponse.json({
          serverTime: new Date().toISOString(),
          wallet: { coins: 18420, gems: 2640 },
          tabs: [],
          items: [
            {
              key: "night",
              tab: "exclusive",
              kind: "board",
              title: "Ночной сигнал",
              description: "",
              rarity: "legendary",
              currency: "gems",
              price: 1680,
              owned: false,
              equipped: false,
            },
            {
              key: "set_garden",
              tab: "bundles",
              kind: "bundle",
              title: "Набор «Сад»",
              description: "",
              rarity: "rare",
              currency: "gems",
              price: 560,
              owned: false,
              equipped: false,
              parts: ["garden"],
              partsOwned: [],
            },
          ],
        }),
      ),
    );
    await renderShop();
    await openTab("Наборы");
    await openCard("Набор «Сад»");
    await fireEvent.press(screen.getByTestId("preview-buy"));
    await act(async () => fireEvent.press(screen.getByText("Купить")));
    await screen.findByText("Покупка прошла");

    await act(async () => fireEvent.press(screen.getByTestId("success-equip")));

    expect(await screen.findByText("Что-то пошло не так. Попробуй ещё раз")).toBeOnTheScreen();
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
    mockServer.use(http.get(mockUrl("/wallet"), () => HttpResponse.json({ gems: 100, coins: 0 })));
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
    await buyMockItem("garden", { emeralds: 520 });
    await renderShop();
    await openTab("Наборы");

    await openCard("Набор «Сад»");

    expect(screen.getByText("Сад на закате")).toBeOnTheScreen();
    expect(screen.getByText("Золотой маркер")).toBeOnTheScreen();
    expect(screen.getByText("Уже есть")).toBeOnTheScreen();
    expect(screen.getByText("900")).toBeOnTheScreen();
  });

  test("shows a complete bundle without a purchase (SHP-09)", async () => {
    await buyMockItem("set_garden", { emeralds: 560 });
    await renderShop();
    await openTab("Наборы");

    await openCard("Набор «Сад»");

    expect(screen.queryByTestId("preview-buy")).toBeNull();
    expect(screen.getAllByText("Собрано").length).toBeGreaterThan(0);
  });

  test("explains an ended offer and closes the preview (SHP-06)", async () => {
    mockServer.use(
      http.post(mockUrl("/shop/items/:key/buy"), () =>
        HttpResponse.json({ error: { code: "offer_ended" } }, { status: 410 }),
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
      http.post(mockUrl("/shop/items/:key/buy"), () =>
        HttpResponse.json({ error: { code: "sold_out" } }, { status: 422 }),
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
    await buyMockItem("reef", { emeralds: 480 });
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
