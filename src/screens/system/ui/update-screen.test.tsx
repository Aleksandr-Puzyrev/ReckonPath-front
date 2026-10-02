import { fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import { Linking } from "react-native";

import { i18n } from "@shared/i18n";
import { bootstrapMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import UpdateScreen from "./update-screen";

const STORE_URL = "https://apps.apple.com/app/id000";

const serveVersion = (message?: string) =>
  mockServer.use(
    http.get(mockUrl("/bootstrap"), () =>
      HttpResponse.json({
        ...bootstrapMock(),
        version: { min: "99.0.0", recommended: "99.0.0", storeUrl: STORE_URL, message },
      }),
    ),
  );

const renderScreen = () => render(<UpdateScreen />, { wrapper: createQueryWrapper() });

describe("UpdateScreen", () => {
  beforeEach(() => i18n.changeLanguage("ru"));

  afterEach(() => mockServer.reset());

  test("opens the store (NET-01)", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    serveVersion();
    await renderScreen();

    await fireEvent.press(await screen.findByRole("button", { name: "Обновить" }));

    expect(openURL).toHaveBeenCalledWith(STORE_URL);
  });

  test("shows the text from the admin panel instead of the default one", async () => {
    serveVersion("Новые скины и быстрее поиск");

    await renderScreen();

    expect(await screen.findByText("Новые скины и быстрее поиск")).toBeOnTheScreen();
  });
});
