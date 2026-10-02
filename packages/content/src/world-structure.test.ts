import { CAMPAIGN } from "./campaign";

const levelAt = (number: number) => {
  const level = CAMPAIGN[number - 1];
  if (level === undefined) throw new Error(`No level ${number}`);
  return level;
};
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);
const hasBeacons = (number: number) => (levelAt(number).beacons ?? []).length > 0;
const hasFences = (number: number) => (levelAt(number).fences ?? []).length > 0;

describe("world 1 (Part 1 §3.1)", () => {
  test("uses 4×4–5×5 boards with one target and no fences", () => {
    range(1, 12).forEach((number) => {
      const level = levelAt(number);
      expect(level.rows).toBeGreaterThanOrEqual(4);
      expect(level.rows).toBeLessThanOrEqual(5);
      expect(level.targets).toHaveLength(1);
      expect(hasFences(number)).toBe(false);
    });
  });

  test("introduces the beacon on levels 4–6", () => {
    expect(range(1, 3).some(hasBeacons)).toBe(false);
    expect(range(4, 6).every(hasBeacons)).toBe(true);
  });

  test("ends with an exam that uses beacons", () => {
    expect(hasBeacons(12)).toBe(true);
  });

  test("starts with the tutorial level without a move limit (Part 4 §2.2)", () => {
    expect(levelAt(1)).toMatchObject({ rows: 4, cols: 4 });
    expect(levelAt(1).moveLimit).toBeUndefined();
  });
});

describe("world 2 (Part 1 §3.1)", () => {
  test("uses 5×5–6×6 boards with one target", () => {
    range(13, 24).forEach((number) => {
      const level = levelAt(number);
      expect(level.rows).toBeGreaterThanOrEqual(5);
      expect(level.rows).toBeLessThanOrEqual(6);
      expect(level.targets).toHaveLength(1);
    });
  });

  test("introduces the fence on levels 13–15 without beacons", () => {
    expect(range(13, 15).every(hasFences)).toBe(true);
    expect(range(13, 15).some(hasBeacons)).toBe(false);
  });

  test("combines fences and beacons on levels 19–21 and in the exam", () => {
    expect([...range(19, 21), 24].every((number) => hasFences(number) && hasBeacons(number))).toBe(
      true,
    );
  });
});

describe("worlds", () => {
  test("every level knows its world and uses the number mode", () => {
    CAMPAIGN.forEach((level, index) => {
      expect(level.world).toBe(index < 12 ? 1 : 2);
      expect(level.probeMode).toBe("distance");
    });
  });
});
