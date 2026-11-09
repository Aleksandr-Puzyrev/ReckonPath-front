import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import NicknameScreen from "./nickname-screen";

const mockRouter = { back: jest.fn(), push: jest.fn(), dismissTo: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const renderNickname = async () => {
  await render(<NicknameScreen />, { wrapper: createQueryWrapper() });
  await screen.findByDisplayValue(/./);
};

const typeNickname = async (nickname: string) => {
  await fireEvent.changeText(screen.getByTestId("nickname-input"), nickname);
};

const changeOnServer = async (nickname: string) => {
  await apiClient.PATCH("/me", { body: { nickname } });
};

const savedNickname = async () => (await apiClient.GET("/me")).data?.nickname;

const emeralds = async () => (await apiClient.GET("/wallet")).data?.gems;

describe("NicknameScreen (design 23.4, decision 0059)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => useAccountStore.getState().markSignedIn());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    jest.clearAllMocks();
    await act(async () => onlineManager.setOnline(true));
  });

  test("makes the first change free and returns to the profile (ACC-12)", async () => {
    const before = await emeralds();
    await renderNickname();
    expect(screen.getByText("Первая смена бесплатна")).toBeOnTheScreen();

    await typeNickname("Nova");
    expect(await screen.findByText("✓ Подходит")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("nickname-save"));

    await waitFor(() =>
      expect(mockRouter.dismissTo).toHaveBeenCalledWith({
        pathname: "/profile",
        params: { notice: "nicknameChanged" },
      }),
    );
    expect(await savedNickname()).toBe("Nova");
    expect(await emeralds()).toBe(before);
  });

  test("charges emeralds for the second change (ACC-12)", async () => {
    await changeOnServer("Nova");
    const before = (await emeralds()) ?? 0;
    await renderNickname();
    expect(screen.getByText("100, следующую смену можно будет сделать не сразу")).toBeOnTheScreen();

    await typeNickname("Nova_2");
    await fireEvent.press(await screen.findByTestId("nickname-save"));

    await waitFor(() => expect(mockRouter.dismissTo).toHaveBeenCalled());
    expect(await emeralds()).toBe(before - 100);
  });

  test("disables saving with the date of the next change before the cooldown ends (ACC-12)", async () => {
    await changeOnServer("Nova");
    await changeOnServer("Nova_2");
    await renderNickname();

    expect(screen.getByText(/^Следующая смена — \d+ \S+$/)).toBeOnTheScreen();
    await typeNickname("Nova_3");
    expect(screen.getByTestId("nickname-save")).toBeDisabled();
  });

  test("shows the date when the server refuses a change before the cooldown ends", async () => {
    await renderNickname();
    await changeOnServer("Nova");
    await changeOnServer("Nova_2");

    await typeNickname("Nova_3");
    await fireEvent.press(await screen.findByTestId("nickname-save"));

    expect(await screen.findByText(/^Следующая смена — \d+ \S+$/)).toBeOnTheScreen();
    expect(mockRouter.dismissTo).not.toHaveBeenCalled();
  });

  test("shows a taken nickname under the field after saving", async () => {
    await renderNickname();

    await typeNickname("Kira");
    await fireEvent.press(await screen.findByTestId("nickname-save"));

    expect(await screen.findByText("Уже занято")).toBeOnTheScreen();
    expect(mockRouter.dismissTo).not.toHaveBeenCalled();
  });

  test.each([
    ["ab", "Минимум 3 символа"],
    ["Пеленг", "Недопустимые символы"],
  ])("checks %s while typing", async (nickname, message) => {
    await renderNickname();

    await typeNickname(nickname);

    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(screen.getByTestId("nickname-save")).toBeDisabled();
  });

  test("does not save the same nickname", async () => {
    await renderNickname();

    expect(screen.getByTestId("nickname-save")).toBeDisabled();
  });

  test("tells about no connection and keeps the nickname offline (decision 0059 #8)", async () => {
    mockServer.use(http.patch(mockUrl("/me"), () => HttpResponse.error()));
    await renderNickname();
    await act(async () => onlineManager.setOnline(false));

    await typeNickname("Nova");
    await fireEvent.press(await screen.findByTestId("nickname-save"));

    expect(await screen.findByText("Нет связи с сервером")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("Nova")).toBeOnTheScreen();
  });

  test("offers ways to earn when emeralds are short", async () => {
    mockServer.use(
      http.patch(mockUrl("/me"), () =>
        HttpResponse.json(
          { error: { code: "not_enough_gems", details: { need: 40, currency: "gems" } } },
          { status: 409 },
        ),
      ),
    );
    await renderNickname();

    await typeNickname("Nova");
    await fireEvent.press(await screen.findByTestId("nickname-save"));

    expect(await screen.findByText(/Не хватает/)).toBeOnTheScreen();
  });
});
