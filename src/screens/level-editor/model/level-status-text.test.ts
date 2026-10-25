import { i18n } from "@shared/i18n";

import { levelStatusTextOf } from "./level-status-text";

describe("levelStatusTextOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("tells the bot estimate of a valid level and the reason of an invalid one", () => {
    expect(levelStatusTextOf({ kind: "valid", norm: 7 }, i18n.t)).toBe(
      "Карта в порядке · Бот решает за ~7 ходов",
    );
    expect(levelStatusTextOf({ kind: "targets", count: 1 }, i18n.t)).toBe("Нужно 1 цели");
    expect(levelStatusTextOf({ kind: "limit", max: 2, cells: [] }, i18n.t)).toBe("Лимит: 2");
  });
});
