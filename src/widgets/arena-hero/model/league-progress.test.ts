import { divisionShare, leagueLabelOf, seasonDaysLeft, stepLabelOf } from "./league-progress";

describe("leagueLabelOf", () => {
  test("joins the league and the division numeral", () => {
    expect(leagueLabelOf("GOLD", 2)).toBe("GOLD II");
  });

  test("leaves Master without a division", () => {
    expect(leagueLabelOf("MASTER", 1)).toBe("MASTER");
  });
});

describe("stepLabelOf", () => {
  test("names the server's league step in capitals with its division", () => {
    expect(stepLabelOf({ title: "Gold", division: "II" })).toBe("GOLD II");
  });

  test("leaves a one-division league without a numeral", () => {
    expect(stepLabelOf({ title: "Master", division: "" })).toBe("MASTER");
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
