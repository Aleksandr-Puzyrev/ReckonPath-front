import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import { FALLBACK_LANGUAGE, resolveLanguage } from "./resolve-language";

export const resources = {
  ru: { translation: ru },
  en: { translation: en },
} as const;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: (typeof resources)["en"];
  }
}

// TODO: the language chosen in settings overrides the system one once the settings screen exists
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(getLocales()[0]?.languageCode),
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
  initAsync: false,
});

export default i18n;
