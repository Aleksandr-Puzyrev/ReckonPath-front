import { focusManager, onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ShopScreen from "./shop-screen";

const DAY_MS = 86_400_000;

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

describe("ShopScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    // Unmounted first: going back online resumes paused requests, which would update the screen (сначала размонтируется: возврат сети возобновляет приостановленные запросы, и они обновили бы экран).
    await cleanup();
    mockServer.reset();
    await act(async () => onlineManager.setOnline(true));
    focusManager.setFocused(undefined);
    jest.useRealTimers();
  });

  test("shows the hero, the limited drop with its timer and the first tab", async () => {
    await renderShop();

    expect(screen.getByText("Собери свой сигнал.")).toBeOnTheScreen();
    expect(screen.getByText("LIMITED DROP")).toBeOnTheScreen();
    expect(screen.getByText("Набор «Шторм»")).toBeOnTheScreen();
    expect(screen.getByText("5 дней")).toBeOnTheScreen();
    expect(
      screen.getByLabelText(/^Ночной сигнал, Поле · в матче, Легендарный, Изумруды: 1680, 5д/),
    ).toBeOnTheScreen();
  });

  test("hides the effects tab and effect items (decision 0022 #6)", async () => {
    await renderShop();

    expect(screen.queryByRole("tab", { name: "Эффекты" })).toBeNull();
    expect(screen.queryByText("Искры")).toBeNull();
  });

  test("marks owned and equipped items and puts them last", async () => {
    await apiClient.POST("/shop/purchase", {
      body: { itemId: "reef", expectedPrice: { emeralds: 480 } },
    });
    await apiClient.POST("/shop/purchase", {
      body: { itemId: "garden", expectedPrice: { emeralds: 520 } },
    });
    await apiClient.PUT("/loadout", { body: { field: "garden" } });
    await renderShop();

    await openTab("Поля");

    expect(screen.getByText("Есть")).toBeOnTheScreen();
    expect(screen.getByText("Надето")).toBeOnTheScreen();
    expect(screen.getByLabelText("Коралловый риф, Поле · в матче, Редкий, Есть")).toBeOnTheScreen();
    expect(
      screen.getByLabelText("Сад на закате, Поле · в матче, Редкий, Надето"),
    ).toBeOnTheScreen();
    const names = screen
      .getAllByRole("button")
      .map(({ props }) => String(props.accessibilityLabel).split(", ")[0]);
    expect(names.slice(-2)).toEqual(["Коралловый риф", "Сад на закате"]);
  });

  test("hides owned items with the chip", async () => {
    await apiClient.POST("/shop/purchase", {
      body: { itemId: "reef", expectedPrice: { emeralds: 480 } },
    });
    await renderShop();
    await openTab("Поля");

    await fireEvent.press(screen.getByRole("checkbox", { name: "Скрыть купленное" }));

    expect(screen.queryByText("Коралловый риф")).toBeNull();
    expect(screen.getByText("Изумрудный ручей")).toBeOnTheScreen();
  });

  test("builds the bundles tab from the bundles", async () => {
    await renderShop();

    await openTab("Наборы");

    expect(screen.getAllByText("Набор").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^Набор «Сад», Набор, Редкий, Изумруды: 560$/)).toBeOnTheScreen();
  });

  test("drops an ended offer after the next refresh (E3-3)", async () => {
    jest.useFakeTimers({ advanceTimers: true });
    await renderShop();
    jest.setSystemTime(Date.now() + 7 * DAY_MS);

    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });

    await waitFor(() => expect(screen.queryByRole("tab", { name: "Эксклюзив" })).toBeNull());
    expect(screen.queryByText("Ночной сигнал")).toBeNull();
    expect(screen.getByRole("tab", { name: "Элементы" })).toBeOnTheScreen();
    expect(screen.queryByText("LIMITED DROP")).toBeNull();
  });

  test("offers a retry after a failed load", async () => {
    mockServer.use(
      http.get(mockUrl("/shop"), () =>
        HttpResponse.json({ error: { code: "INTERNAL" } }, { status: 500 }),
      ),
    );
    await render(<ShopScreen />, { wrapper: createQueryWrapper() });
    await screen.findByTestId("shop-retry");
    mockServer.reset();

    await act(async () => fireEvent.press(screen.getByTestId("shop-retry")));

    expect(await screen.findByText("Ночной сигнал")).toBeOnTheScreen();
  });

  test("keeps the cached catalog offline with its update time (NET-06)", async () => {
    await renderShop();

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByText(/^Обновлено /)).toBeOnTheScreen();
    expect(screen.getByText("Ночной сигнал")).toBeOnTheScreen();
  });

  test("says there is no network when nothing is cached (NET-06)", async () => {
    await act(async () => onlineManager.setOnline(false));
    mockServer.use(http.get(mockUrl("/shop"), () => HttpResponse.error()));

    await render(<ShopScreen />, { wrapper: createQueryWrapper() });

    expect(
      await screen.findByText("Нет сети. Кампания и дейли работают без интернета"),
    ).toBeOnTheScreen();
  });
});
