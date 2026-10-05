import { formatNumber } from "./format-number";

describe("formatNumber", () => {
  test("separates thousands by the locale", () => {
    expect(formatNumber(18420, "en")).toBe("18,420");
    // The kind of no-break space depends on the ICU version (вид неразрывного пробела зависит от версии ICU).
    expect(formatNumber(18420, "ru").replace(/\s/gu, " ")).toBe("18 420");
  });
});
