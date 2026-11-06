import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as WebBrowser from "expo-web-browser";
import { http, HttpResponse } from "msw/http";

import { useAccountStore } from "@entities/session";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl, requireMockConsent } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ConsentsScreen from "./consents-screen";

jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn(async () => ({})) }));

const renderConsents = async () => {
  await render(<ConsentsScreen />, { wrapper: createQueryWrapper() });
  await waitFor(() => expect(screen.getByTestId("consents-accept")).toBeEnabled());
};

const requiredOnServer = async () => (await apiClient.GET("/me")).data?.consentsRequired;

describe("ConsentsScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    useAccountStore.getState().markSignedIn();
    requireMockConsent("privacy");
  });

  afterEach(() => {
    mockServer.reset();
    useAccountStore.getState().reset();
  });

  test("shows the approved texts (decision 0056 #3)", async () => {
    await renderConsents();

    expect(screen.getByText("Мы обновили документы")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Прочитай и прими новые условия и политику конфиденциальности, чтобы продолжить.",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText("Принять")).toBeOnTheScreen();
  });

  test("accepts the new versions on the server (decision 0056 #3)", async () => {
    await renderConsents();

    await fireEvent.press(screen.getByTestId("consents-accept"));

    await waitFor(async () => expect(await requiredOnServer()).toEqual([]));
  });

  test("keeps the screen with a toast when the request fails", async () => {
    mockServer.use(http.put(mockUrl("/me/consents"), () => HttpResponse.error()));
    await renderConsents();

    await fireEvent.press(screen.getByTestId("consents-accept"));

    expect(await screen.findByText("Нет связи с сервером")).toBeOnTheScreen();
    expect(screen.getByText("Мы обновили документы")).toBeOnTheScreen();
  });

  test("signs out to a guest instead of accepting (decision 0056 #3)", async () => {
    await renderConsents();

    await fireEvent.press(screen.getByTestId("consents-sign-out"));

    await waitFor(() => expect(useAccountStore.getState().hasLogin).toBe(false));
  });

  test("opens the privacy policy (decision 0056 #5)", async () => {
    await renderConsents();

    await fireEvent.press(screen.getByTestId("consents-privacy"));

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      expect.stringContaining("/document?type=privacy_policy"),
    );
  });
});
