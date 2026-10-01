import { divisionOf, leagueOf } from "./league";

describe("leagues and divisions", () => {
  test("covers every league from zero trophies", () => {
    expect([0, 800, 2000, 3200, 4400, 5600].map(leagueOf)).toEqual([
      "bronze",
      "silver",
      "gold",
      "platinum",
      "diamond",
      "master",
    ]);
  });

  test("gives the top division just below the next league", () => {
    expect(divisionOf(799)).toBe("I");
    expect(divisionOf(5599)).toBe("I");
  });
});
