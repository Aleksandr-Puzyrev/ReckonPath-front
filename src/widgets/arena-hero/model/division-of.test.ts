import { divisionStateOf } from "./division-of";

describe("divisionStateOf", () => {
  test("places Bronze III at the bottom of the league", () => {
    expect(divisionStateOf(0)).toEqual({ league: "BRONZE", division: 3, min: 0, max: 267 });
  });

  test("names the division and its range inside a league", () => {
    expect(divisionStateOf(2640)).toEqual({ league: "GOLD", division: 2, min: 2400, max: 2800 });
  });

  test("leaves Master without an upper bound", () => {
    expect(divisionStateOf(6000)).toEqual(
      expect.objectContaining({ league: "MASTER", min: 5600, max: 6000 }),
    );
  });
});
