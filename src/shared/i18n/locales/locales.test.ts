import en from "./en.json";
import ru from "./ru.json";

const collectKeys = (value: unknown, prefix = ""): string[] => {
  if (typeof value !== "object" || value === null) return [prefix];

  return Object.entries(value).flatMap(([key, nested]) =>
    collectKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
};

// Languages have different plural forms, so keys are compared without the form suffix (у языков разные формы множественного числа, поэтому ключи сравниваются без суффикса формы).
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

const baseKeys = (locale: unknown) => [
  ...new Set(collectKeys(locale).map((key) => key.replace(PLURAL_SUFFIX, ""))),
];

describe("locales", () => {
  test("RU and EN define the same keys", () => {
    expect(baseKeys(ru).sort()).toEqual(baseKeys(en).sort());
  });

  test("no translation is empty", () => {
    [ru, en].forEach((locale) => {
      collectKeys(locale).forEach((key) => {
        const text = key
          .split(".")
          .reduce<unknown>((node, segment) => (node as Record<string, unknown>)[segment], locale);
        expect(typeof text === "string" && text.trim().length > 0).toBe(true);
      });
    });
  });
});
