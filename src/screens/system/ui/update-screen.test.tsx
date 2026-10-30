import { fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import { Linking } from "react-native";

import { i18n } from "@shared/i18n";
import { mockServer, mockUrl, versionMock } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import UpdateScreen from "./update-screen";

const STORE_URL = "https://apps.apple.com/app/id000";

const serveForcedUpdate = (appStore = STORE_URL) =>
  mockServer.use(
    http.get(mockUrl("/version"), () =>
      HttpResponse.json(
        versionMock({ forceUpdate: true, appStore, description: "Скачайте новую версию" }),
      ),
    ),
  );

const renderScreen = () => render(<UpdateScreen />, { wrapper: createQueryWrapper() });

describe("UpdateScreen", () => {
  beforeEach(() => i18n.changeLanguage("ru"));

  afterEach(() => mockServer.reset());

  test("opens the store of this platform (NET-01, decision 0049 #6)", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    serveForcedUpdate();
    await renderScreen();

    await fireEvent.press(await screen.findByRole("button", { name: "Обновить" }));

    expect(openURL).toHaveBeenCalledWith(STORE_URL);
  });

  test("shows the client's text, not the backend's (decision 0049 #3)", async () => {
    serveForcedUpdate();

    await renderScreen();

    expect(
      await screen.findByText(
        "Эта версия больше не поддерживается. Обнови игру, чтобы продолжить — прогресс сохранится.",
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Скачайте новую версию")).toBeNull();
  });

  test("hides «Обновить» when the backend has no link for this store", async () => {
    serveForcedUpdate("");
    await renderScreen();

    await screen.findByText("Доступна новая версия");

    expect(screen.queryByRole("button", { name: "Обновить" })).toBeNull();
  });
});
