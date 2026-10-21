import { themeNameFor, themeNameOf } from "./system-theme";

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

describe("themeNameOf", () => {
  test("follows the system for «Как в системе» (NET-13)", () => {
    expect(themeNameOf("system", "light")).toBe("light");
    expect(themeNameOf("system", "dark")).toBe("dark");
  });

  test("keeps a chosen theme whatever the system says (decision 0040 #9)", () => {
    expect(themeNameOf("light", "dark")).toBe("light");
    expect(themeNameOf("dark", "light")).toBe("dark");
  });
});
