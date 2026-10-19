import { i18n } from "@shared/i18n";

import { bannerTextOf } from "./banner-text";

describe("bannerTextOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("names whose turn it is", () => {
    expect(bannerTextOf("myTurn", "me", [], i18n.t)).toBe("Твой ход");
    expect(bannerTextOf("opponentTurn", "opponent", [], i18n.t)).toBe("Ход соперника");
  });

  test("explains a bomb skip on either side (PVP-03)", () => {
    const mine = [{ player: "me" as const, reason: "bomb" as const }];
    const theirs = [{ player: "opponent" as const, reason: "bomb" as const }];

    expect(bannerTextOf("opponentTurn", "opponent", mine, i18n.t)).toBe(
      "Ты пропускаешь ход — бомба",
    );
    expect(bannerTextOf("myTurn", "me", theirs, i18n.t)).toBe("Ловушка сработала! Ходи ещё раз");
  });

  test("marks the final turn for each side (PVP-09)", () => {
    expect(bannerTextOf("finalTurn", "me", [], i18n.t)).toBe("Финальный ход!");
    expect(bannerTextOf("finalTurn", "opponent", [], i18n.t)).toBe("Финальный ход соперника");
  });
});
