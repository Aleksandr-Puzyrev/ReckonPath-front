import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useAccountStore } from "@entities/session";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useLocaleSync } from "./use-locale-sync";

const savedLocale = async () => (await apiClient.GET("/me")).data?.locale;

describe("useLocaleSync (decision 0058 #7)", () => {
  beforeEach(() => useAccountStore.getState().markSignedIn());

  afterEach(async () => {
    mockServer.reset();
    useAccountStore.getState().reset();
    await i18n.changeLanguage("ru");
  });

  test("saves the interface language to the account after sign-in", async () => {
    await i18n.changeLanguage("en");

    await renderHook(useLocaleSync, { wrapper: createQueryWrapper() });

    await waitFor(async () => expect(await savedLocale()).toBe("en"));
  });

  test("follows a language switch", async () => {
    await renderHook(useLocaleSync, { wrapper: createQueryWrapper() });
    await waitFor(async () => expect(await savedLocale()).toBe("ru"));

    await act(() => i18n.changeLanguage("en"));

    await waitFor(async () => expect(await savedLocale()).toBe("en"));
  });

  test("does not repeat a failed save", async () => {
    let patches = 0;
    mockServer.use(
      http.patch(mockUrl("/me"), () => {
        patches += 1;
        return HttpResponse.json({ error: { code: "internal_error" } }, { status: 500 });
      }),
    );
    await i18n.changeLanguage("en");

    await renderHook(useLocaleSync, { wrapper: createQueryWrapper() });
    await waitFor(() => expect(patches).toBe(1));
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

    expect(patches).toBe(1);
  });
});
