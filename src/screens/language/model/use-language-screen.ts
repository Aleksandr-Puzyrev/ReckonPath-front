import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { TUTORIAL } from "@reckon-path/content";

import { useChangeLanguage } from "@features/change-language";
import { useSettingsStore } from "@entities/settings";
import { resolveLanguage } from "@shared/i18n";

export const useLanguageScreen = () => {
  const { i18n } = useTranslation();
  // A failed language save keeps the local choice; the server gets it on the next change (неудачное сохранение языка оставляет локальный выбор; сервер получит его при следующей смене).
  const changeLanguage = useChangeLanguage(() => undefined);
  const current = resolveLanguage(i18n.language);

  return {
    current,
    handlePick: changeLanguage,
    handleContinue: () => {
      // Keeping the shown language saves it, so the step is not asked again (оставленный язык сохраняется, и шаг больше не спрашивается).
      if (useSettingsStore.getState().language === null) changeLanguage(current);
      router.replace({
        pathname: "/play/[mode]/[id]",
        params: { mode: "campaign", id: TUTORIAL.levelId },
      });
    },
  };
};
