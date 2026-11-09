import { useSettingsStore } from "@entities/settings";
import { applyLanguage } from "@shared/i18n";
import type { AppLanguage } from "@shared/i18n";

export const changeLanguage = (language: AppLanguage) => {
  useSettingsStore.getState().setLanguage(language);
  applyLanguage(language);
};
