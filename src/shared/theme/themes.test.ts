import { darkTheme, lightTheme } from "./themes";

const collectKeyPaths = (value: unknown, prefix = ""): string[] => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [prefix];

  return Object.entries(value).flatMap(([key, nested]) =>
    collectKeyPaths(nested, prefix ? `${prefix}.${key}` : key),
  );
};

describe("themes", () => {
  test("light and dark themes define the same color tokens", () => {
    expect(collectKeyPaths(darkTheme.colors).sort()).toEqual(
      collectKeyPaths(lightTheme.colors).sort(),
    );
  });

  test("light and dark themes define the same elevation tokens", () => {
    expect(Object.keys(darkTheme.elevation).sort()).toEqual(
      Object.keys(lightTheme.elevation).sort(),
    );
  });

  test("every color token is a non-empty string in both themes", () => {
    const colorValues = [lightTheme.colors, darkTheme.colors].flatMap((colors) =>
      collectKeyPaths(colors).map((path) =>
        path
          .split(".")
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], colors),
      ),
    );

    colorValues.forEach((color) => {
      expect(typeof color).toBe("string");
      expect(color).not.toBe("");
    });
  });
});
