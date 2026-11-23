import { formatPercent } from "./format-percent";

describe("formatPercent", () => {
  test("prints a whole percent by the locale", () => {
    expect(formatPercent(64, "en")).toBe("64%");
    expect(formatPercent(64, "ru").replace(/\s/gu, " ")).toBe("64 %");
  });
});
