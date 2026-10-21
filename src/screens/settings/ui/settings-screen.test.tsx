import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { useSettingsStore } from "@entities/settings";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import SettingsScreen from "./settings-screen";

const mockRouter = { back: jest.fn(), push: jest.fn() };
const mockClipboard = { setStringAsync: jest.fn(async (_text: string) => true) };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("expo-clipboard", () => ({
  setStringAsync: (text: string) => mockClipboard.setStringAsync(text),
}));
jest.mock("expo-store-review", () => ({
  hasAction: async () => true,
  requestReview: async () => undefined,
}));
jest.mock("expo-application", () => ({
  nativeApplicationVersion: "1.4.2",
  nativeBuildVersion: "318",
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardDemo: () => null }));

const PLAYER_ID = "0192a000-0000-7000-8000-000000004821";

const renderSettings = async () => {
  await render(<SettingsScreen />, { wrapper: createQueryWrapper() });
  await screen.findByText(PLAYER_ID);
};

describe("SettingsScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ru");
    Object.values(mockRouter).forEach((mock) => mock.mockClear());
  });

  afterEach(async () => {
    await cleanup();
    useSettingsStore.getState().reset();
    useAccountStore.getState().reset();
    mockServer.reset();
  });

  test("shows the visible groups of design 25.1 for a guest (decision 0040)", async () => {
    await renderSettings();

    expect(screen.getByText("Настройки")).toBeOnTheScreen();
    expect(screen.getByText("Звуки")).toBeOnTheScreen();
    expect(screen.getByText("A1…G7 по краям поля")).toBeOnTheScreen();
    expect(screen.getByText("Гость")).toBeOnTheScreen();
    expect(screen.getByText("Привязать аккаунт")).toBeOnTheScreen();
    expect(screen.queryByText("Выйти")).toBeNull();
    expect(screen.getByText("RECKON PATH · 1.4.2 (318)")).toBeOnTheScreen();
    expect(screen.queryByText("Высокий контраст поля")).toBeNull();
  });

  test("stores the switches and the theme", async () => {
    await renderSettings();

    await fireEvent(screen.getByTestId("settings-coordinates"), "valueChange", false);
    await fireEvent(screen.getByTestId("settings-pvp-confirm"), "valueChange", true);
    await fireEvent.press(screen.getByTestId("settings-theme-light"));

    expect(useSettingsStore.getState()).toMatchObject({
      isCoordinatesOn: false,
      isPvpTapConfirmOn: true,
      theme: "light",
    });
  });

  test("switches the language without a restart (NET-12)", async () => {
    await renderSettings();

    await fireEvent.press(screen.getByTestId("settings-language-en"));

    expect(await screen.findByText("Settings")).toBeOnTheScreen();
    expect(screen.getByText("Language: English")).toBeOnTheScreen();
    expect(useSettingsStore.getState().language).toBe("en");
  });

  test("copies the player ID with a toast", async () => {
    await renderSettings();

    await fireEvent.press(screen.getByTestId("settings-player-id"));

    expect(mockClipboard.setStringAsync).toHaveBeenCalledWith(PLAYER_ID);
    expect(await screen.findByText("ID скопирован")).toBeOnTheScreen();
  });

  test("signs a linked account out to a new guest (decision 0040 #3)", async () => {
    useAccountStore.getState().markSignedIn();
    await renderSettings();
    expect(screen.getByText("Player4821")).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId("settings-sign-out"));

    expect(await screen.findByText("Ты вышел из аккаунта")).toBeOnTheScreen();
    expect(useAccountStore.getState().hasLogin).toBe(false);
  });

  test("deletes the account after the nickname (design 26.3–26.4)", async () => {
    await renderSettings();

    await fireEvent.press(screen.getByTestId("settings-delete"));
    expect(screen.getByText("Что удалится")).toBeOnTheScreen();
    expect(screen.getByText("Прогресс кампании")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("delete-continue"));
    await fireEvent.changeText(screen.getByTestId("delete-nickname"), "Player");
    expect(await screen.findByText("Ник не совпадает")).toBeOnTheScreen();
    expect(screen.getByTestId("delete-forever")).toBeDisabled();
    await fireEvent.changeText(screen.getByTestId("delete-nickname"), "Player4821");
    await waitFor(() => expect(screen.getByTestId("delete-forever")).toBeEnabled());
    await fireEvent.press(screen.getByTestId("delete-forever"));

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/settings/deletion"));
    expect((await apiClient.GET("/me")).data?.flags.deletionScheduledAt).not.toBeNull();
  });

  test("leads to the deletion screen once it is scheduled (decision 0040 #15)", async () => {
    await apiClient.DELETE("/me", { body: { confirmNickname: "Player4821" } });
    await renderSettings();

    expect(screen.getByText(/^Удаление \d+ \S+$/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("settings-delete"));

    expect(mockRouter.push).toHaveBeenCalledWith("/settings/deletion");
  });

  test("sends a support request", async () => {
    await renderSettings();

    await fireEvent.press(screen.getByTestId("settings-support"));
    await fireEvent.changeText(screen.getByTestId("support-message"), "Не грузится дейли");
    await waitFor(() => expect(screen.getByTestId("support-send")).toBeEnabled());
    await fireEvent.press(screen.getByTestId("support-send"));

    expect(await screen.findByText("Обращение отправлено")).toBeOnTheScreen();
  });

  test("opens the game rules", async () => {
    await renderSettings();

    await act(() => fireEvent.press(screen.getByTestId("settings-rules")));

    expect(screen.getAllByText("Правила игры").length).toBeGreaterThan(0);
  });
});
