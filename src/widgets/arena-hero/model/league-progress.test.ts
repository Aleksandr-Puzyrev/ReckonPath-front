import { divisionShare, leagueLabelOf, nextDivisionOf, seasonDaysLeft } from "./league-progress";

describe("leagueLabelOf", () => {
  test("joins the league and the division numeral", () => {
    expect(leagueLabelOf("GOLD", 2)).toBe("GOLD II");
  });

  test("leaves Master without a division", () => {
    expect(leagueLabelOf("MASTER", 1)).toBe("MASTER");
  });
});

describe("nextDivisionOf", () => {
  test("goes up a division inside the league", () => {
    expect(nextDivisionOf("GOLD", 2)).toBe("GOLD I");
  });

  test("goes to the lowest division of the next league from division I (decision 0031 #10)", () => {
    expect(nextDivisionOf("GOLD", 1)).toBe("PLATINUM III");
  });

  test("names Master after Diamond I", () => {
    expect(nextDivisionOf("DIAMOND", 1)).toBe("MASTER");
  });

  test("has nothing after Master", () => {
    expect(nextDivisionOf("MASTER", 1)).toBeNull();
  });
});

describe("divisionShare", () => {
  test("measures the way through the division", () => {
    expect(divisionShare(2640, 2400, 2800)).toBe(0.6);
  });

  test("stays within the bar", () => {
    expect(divisionShare(3000, 2400, 2800)).toBe(1);
    expect(divisionShare(100, 2400, 2800)).toBe(0);
  });
});

describe("seasonDaysLeft", () => {
  test("rounds a started day up", () => {
    const now = Date.parse("2026-10-18T12:00:00Z");

    expect(seasonDaysLeft("2026-10-30T00:00:00Z", now)).toBe(12);
  });

  test("never goes below zero", () => {
    expect(seasonDaysLeft("2026-10-01T00:00:00Z", Date.parse("2026-10-18T00:00:00Z"))).toBe(0);
  });
});
