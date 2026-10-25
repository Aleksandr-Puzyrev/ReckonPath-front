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
const hasStreams = (number: number) => (levelAt(number).streams ?? []).length > 0;
const hasBridges = (number: number) => (levelAt(number).bridges ?? []).length > 0;
const hasHeavy = (number: number) => (levelAt(number).heavy ?? []).length > 0;
const hasBombs = (number: number) => (levelAt(number).bombs ?? []).length > 0;
const hasBuoys = (number: number) => (levelAt(number).buoys ?? []).length > 0;
const hasRocks = (number: number) => (levelAt(number).rocks ?? []).length > 0;
const WORLD_STARTS = [1, 13, 25, 37, 49, 62] as const;
const COURSE_LEVELS = range(68, 74);
const worldOf = (number: number) => WORLD_STARTS.filter((start) => number >= start).length;

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

describe("world 3 (Part 1 §3.1)", () => {
  test("uses 6×6 boards with one target", () => {
    range(25, 36).forEach((number) => {
      expect(levelAt(number)).toMatchObject({ rows: 6, cols: 6 });
      expect(levelAt(number).targets).toHaveLength(1);
    });
  });

  test("introduces the stream on levels 25–27 and the bridge on levels 31–33", () => {
    expect(range(25, 27).every(hasStreams)).toBe(true);
    expect(range(25, 30).some(hasBridges)).toBe(false);
    expect(range(31, 33).every(hasBridges)).toBe(true);
  });

  test("ends with an exam of streams, bridges, fences and a beacon", () => {
    expect(hasStreams(36) && hasBridges(36) && hasFences(36) && hasBeacons(36)).toBe(true);
  });
});

describe("world 4 (Part 1 §3.1)", () => {
  test("uses 6×6–7×7 boards with 2–3 targets", () => {
    range(37, 48).forEach((number) => {
      const level = levelAt(number);
      expect(level.rows).toBeGreaterThanOrEqual(6);
      expect(level.rows).toBeLessThanOrEqual(7);
      expect(level.targets.length).toBeGreaterThanOrEqual(2);
      expect(level.targets.length).toBeLessThanOrEqual(3);
    });
  });

  test("introduces the ×2 tile on levels 43–45", () => {
    expect(range(37, 42).some(hasHeavy)).toBe(false);
    expect(range(43, 45).every(hasHeavy)).toBe(true);
  });
});

describe("world 5 (Part 1 §3.1)", () => {
  test("uses 7×7 boards with 1–2 targets", () => {
    range(49, 61).forEach((number) => {
      expect(levelAt(number)).toMatchObject({ rows: 7, cols: 7 });
      expect(levelAt(number).targets.length).toBeLessThanOrEqual(2);
    });
  });

  test("introduces the bomb on levels 49–51 and the buoy on levels 55–57", () => {
    expect(range(49, 51).every(hasBombs)).toBe(true);
    expect(range(49, 54).some(hasBuoys)).toBe(false);
    expect(range(55, 57).every(hasBuoys)).toBe(true);
  });

  test("hides the mine mark only on level 59 (LVL-BN6)", () => {
    expect(range(49, 61).filter((number) => levelAt(number).bombHint === false)).toEqual([59]);
  });
});

describe("world 6 (Part 1 §3.1)", () => {
  test("uses 7×7 boards with 1–2 targets", () => {
    range(62, 74).forEach((number) => {
      expect(levelAt(number)).toMatchObject({ rows: 7, cols: 7 });
      expect(levelAt(number).targets.length).toBeLessThanOrEqual(2);
    });
  });

  test("introduces the rock on levels 62–64", () => {
    expect(range(1, 61).some(hasRocks)).toBe(false);
    expect(range(62, 64).every(hasRocks)).toBe(true);
  });

  test("switches to the «Курс» mode on levels 68–74", () => {
    expect(range(62, 67).every((number) => levelAt(number).probeMode === "distance")).toBe(true);
    expect(COURSE_LEVELS.every((number) => levelAt(number).probeMode === "direction")).toBe(true);
  });
});

describe("worlds", () => {
  test("every level knows its world and uses the number mode outside «Курс» levels", () => {
    CAMPAIGN.forEach((level, index) => {
      const number = index + 1;
      expect(level.world).toBe(worldOf(number));
      if (COURSE_LEVELS.includes(number)) return;
      expect(level.probeMode).toBe("distance");
    });
  });
});
