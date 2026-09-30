export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;
export const FALLBACK_LANGUAGE = "en";

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupportedLanguage = (code: string): code is AppLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(code);

export const resolveLanguage = (languageCode: string | null | undefined): AppLanguage => {
  const code = languageCode?.toLowerCase();
  if (code && isSupportedLanguage(code)) return code;

  return FALLBACK_LANGUAGE;
};
