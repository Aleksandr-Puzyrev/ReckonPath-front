import { splitTimeLeft } from "./split-time-left";

describe("splitTimeLeft", () => {
  test("splits into days, hours and minutes", () => {
    expect(splitTimeLeft(((2 * 24 + 3) * 60 + 4) * 60_000 + 59_000)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
    });
  });

  test("never goes below zero", () => {
    expect(splitTimeLeft(-1)).toEqual({ days: 0, hours: 0, minutes: 0 });
  });
});
