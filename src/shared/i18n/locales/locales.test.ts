import en from "./en.json";
import ru from "./ru.json";

const collectKeys = (value: unknown, prefix = ""): string[] => {
  if (typeof value !== "object" || value === null) return [prefix];

  return Object.entries(value).flatMap(([key, nested]) =>
    collectKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
};

describe("locales", () => {
  test("RU and EN define the same keys", () => {
    expect(collectKeys(ru).sort()).toEqual(collectKeys(en).sort());
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
