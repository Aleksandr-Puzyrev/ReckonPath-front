import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useSettingsStore } from "@entities/settings";
import { i18n } from "@shared/i18n";
import { mockLocale } from "@shared/api/mocks/me-handlers";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useChangeLanguage } from "./use-change-language";

describe("useChangeLanguage", () => {
  beforeEach(() => i18n.changeLanguage("ru"));

  afterEach(() => {
    useSettingsStore.getState().reset();
    mockServer.reset();
  });

  test("switches the interface at once and tells the server (NET-12)", async () => {
    const { result } = await renderHook(() => useChangeLanguage(jest.fn()), {
      wrapper: createQueryWrapper(),
    });

    await act(() => result.current("en"));

    expect(i18n.language).toBe("en");
    expect(useSettingsStore.getState().language).toBe("en");
    await waitFor(() => expect(mockLocale()).toBe("en"));
  });
});
