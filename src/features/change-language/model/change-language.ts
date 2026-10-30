import { useSettingsStore } from "@entities/settings";
import { applyLanguage } from "@shared/i18n";
import type { AppLanguage } from "@shared/i18n";

// The backend keeps no language yet, so it lives on the device only (бэкенд пока не хранит язык, поэтому он живёт только на устройстве).
export const changeLanguage = (language: AppLanguage) => {
  useSettingsStore.getState().setLanguage(language);
  applyLanguage(language);
};
