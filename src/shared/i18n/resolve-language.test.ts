import { resolveLanguage } from "./resolve-language";

describe("resolveLanguage", () => {
  test("keeps a supported system language", () => {
    expect(resolveLanguage("ru")).toBe("ru");
    expect(resolveLanguage("en")).toBe("en");
  });

  test("ignores the letter case of the language code", () => {
    expect(resolveLanguage("RU")).toBe("ru");
  });

  test("falls back to English for an unsupported language", () => {
    expect(resolveLanguage("de")).toBe("en");
  });

  test("falls back to English when the system language is unknown", () => {
    expect(resolveLanguage(null)).toBe("en");
    expect(resolveLanguage(undefined)).toBe("en");
  });
});
