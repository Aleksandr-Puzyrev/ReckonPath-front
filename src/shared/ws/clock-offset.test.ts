import { medianOffset, offsetSample } from "./clock-offset";

describe("offsetSample", () => {
  test("compares the server time with the middle of the round trip", () => {
    expect(offsetSample(1_000, 8_200, 1_400)).toBe(7_000);
  });
});

describe("medianOffset", () => {
  test("takes the median, so one slow ping does not skew it (Part 8 §9.2)", () => {
    expect(medianOffset([100, 120, 5_000, 110, 90])).toBe(110);
  });

  test("averages the two middle samples of an even count", () => {
    expect(medianOffset([100, 200])).toBe(150);
  });

  test("assumes no offset before the first sample", () => {
    expect(medianOffset([])).toBe(0);
  });
});
