import { i18n } from "@shared/i18n";
import { mapMatchMock, playingMatchMock } from "@shared/test-utils/api-mock";

import { bannerTextOf } from "./banner-text";

describe("bannerTextOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("names whose turn it is", () => {
    expect(bannerTextOf(playingMatchMock({ turn: "me" }), i18n.t)).toBe("Твой ход");
    expect(bannerTextOf(playingMatchMock({ turn: "rival" }), i18n.t)).toBe("Ход соперника");
  });

  test("tells about my skipped turn after a bomb", () => {
    const match = playingMatchMock({ turn: "rival" });

    expect(bannerTextOf({ ...match, me: { ...match.me, skips: 1 } }, i18n.t)).toBe(
      "Ты пропускаешь ход — бомба",
    );
  });

  test("shows the final turn as the backend gives it", () => {
    expect(bannerTextOf(playingMatchMock({ turn: "me", final: true }), i18n.t)).toBe(
      "Финальный ход!",
    );
    expect(bannerTextOf(playingMatchMock({ turn: "rival", final: true }), i18n.t)).toBe(
      "Финальный ход соперника",
    );
  });

  test("shows my moves against the norm in a map match", () => {
    const match = mapMatchMock({ norm: 6 });

    expect(bannerTextOf({ ...match, me: { ...match.me, moves: 3 } }, i18n.t)).toBe(
      "Ты: 3 хода · Норма: 6",
    );
  });
});
