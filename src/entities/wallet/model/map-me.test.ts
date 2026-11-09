import type { components } from "@shared/api";

import { mapMe } from "./map-me";

const BACKEND_ME: components["schemas"]["Me"] = {
  id: "u1",
  nickname: "star_runner",
  locale: "ru",
  level: 18,
  xp: 40,
  xpToNext: 360,
  nicknameChange: { price: 0, currency: "gems" },
  flags: { deletionScheduledAt: null },
  consents: [],
  consentsRequired: [],
};

describe("mapMe", () => {
  test("names the league in upper case and the division by number", () => {
    const me = mapMe({ ...BACKEND_ME, arena: { trophies: 2640, league: "gold", division: "II" } });

    expect(me.arena).toEqual({ trophies: 2640, league: "GOLD", division: 2 });
  });

  test("maps every division", () => {
    const divisionOf = (division: "III" | "II" | "I") =>
      mapMe({ ...BACKEND_ME, arena: { trophies: 0, league: "bronze", division } }).arena?.division;

    expect([divisionOf("III"), divisionOf("II"), divisionOf("I")]).toEqual([3, 2, 1]);
  });

  test("keeps a player without arena data as is", () => {
    expect(mapMe(BACKEND_ME)).toEqual(BACKEND_ME);
  });
});
