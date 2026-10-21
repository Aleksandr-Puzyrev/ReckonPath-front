import "./plural-rules-polyfill";

import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import { FALLBACK_LANGUAGE, resolveLanguage, SUPPORTED_LANGUAGES } from "./resolve-language";
import type { AppLanguage } from "./resolve-language";

export const resources = {
  ru: { translation: ru },
  en: { translation: en },
} as const;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: (typeof resources)["en"];
  }
}

const systemLanguageCode = () => getLocales()[0]?.languageCode?.toLowerCase() ?? null;

const systemLanguage = () => resolveLanguage(systemLanguageCode());

export const isSystemLanguageSupported = () => {
  const code = systemLanguageCode();
  return code !== null && (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
};

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: systemLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
  initAsync: false,
});

// A language chosen in the settings wins over the system one (язык, выбранный в настройках, важнее системного).
export const applyLanguage = (language: AppLanguage | null) => {
  const next = language ?? systemLanguage();
  if (i18n.language !== next) void i18n.changeLanguage(next);
};

export default i18n;
