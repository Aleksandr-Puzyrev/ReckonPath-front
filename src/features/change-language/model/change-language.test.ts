import { useSettingsStore } from "@entities/settings";
import { i18n } from "@shared/i18n";

import { changeLanguage } from "./change-language";

describe("changeLanguage", () => {
  afterEach(() => useSettingsStore.getState().reset());

  test("switches the interface at once and keeps the choice on the device (NET-12, decision 0052 #3)", async () => {
    changeLanguage("en");

    expect(i18n.language).toBe("en");
    expect(useSettingsStore.getState().language).toBe("en");
  });
});
