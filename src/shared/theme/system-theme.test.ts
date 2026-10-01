import { themeNameFor } from "./system-theme";

describe("themeNameFor", () => {
  test.each([
    ["light", "light"],
    ["dark", "dark"],
    [null, "dark"],
    [undefined, "dark"],
  ] as const)("maps the system scheme %s to the %s theme", (scheme, theme) => {
    expect(themeNameFor(scheme)).toBe(theme);
  });
});
