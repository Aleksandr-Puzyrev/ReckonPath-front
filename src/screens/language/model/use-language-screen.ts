import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { changeLanguage } from "@features/change-language";
import { useSettingsStore } from "@entities/settings";
import { resolveLanguage } from "@shared/i18n";

export const useLanguageScreen = () => {
  const { i18n } = useTranslation();
  const current = resolveLanguage(i18n.language);

  return {
    current,
    handlePick: changeLanguage,
    handleContinue: () => {
      // Keeping the shown language saves it, so the step is not asked again (оставленный язык сохраняется, и шаг больше не спрашивается).
      if (useSettingsStore.getState().language === null) changeLanguage(current);
      // Without an account the root leads to sign-in, with one — to the level 1 tutorial (без аккаунта корень ведёт ко входу, с аккаунтом — к обучению на уровне 1).
      router.replace("/");
    },
  };
};
