import { i18n } from "@shared/i18n";

import { banLinesOf } from "./ban-lines";

describe("banLinesOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("tells the reason, the end date and the player ID (decision 0038 #4)", () => {
    const ban = {
      scope: "arena" as const,
      until: "2026-10-12T00:00:00Z",
      reason: "бустинг кубков",
    };

    expect(banLinesOf(ban, "RP-48210-7F", i18n.t, "ru")).toEqual([
      "Причина: бустинг кубков. До 12 октября",
      "ID: RP-48210-7F",
    ]);
  });

  test("says «Навсегда» for a ban without an end and skips an unknown ID", () => {
    const ban = { scope: "all" as const, until: null, reason: "читы" };

    expect(banLinesOf(ban, null, i18n.t, "ru")).toEqual(["Причина: читы. Навсегда"]);
  });
});
