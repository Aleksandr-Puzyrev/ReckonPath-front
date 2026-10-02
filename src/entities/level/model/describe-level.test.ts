import type { LevelInput } from "@reckon-path/engine";

import { i18n } from "@shared/i18n";

import { describeLevel, levelElements } from "./describe-level";

const LEVEL: LevelInput = {
  v: 2,
  id: "c-describe",
  rows: 7,
  cols: 7,
  targets: [
    [0, 0],
    [6, 6],
  ],
  bombs: [[3, 3]],
  bridges: [
    [1, 1],
    [2, 1],
  ],
  streams: [
    [1, 1],
    [2, 1],
  ],
  probeMode: "distance",
};

describe("describeLevel", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("ru");
  });

  test("lists the size, the targets, and each element", () => {
    expect(describeLevel(i18n.t, LEVEL)).toBe("7×7 · 2 цели · 1 бомба · ручей · 2 моста");
  });

  test("names a plain level by size and targets only", () => {
    expect(
      describeLevel(i18n.t, { ...LEVEL, bombs: [], streams: [], bridges: [], targets: [[0, 0]] }),
    ).toBe("7×7 · 1 цель");
  });
});

describe("levelElements", () => {
  test("counts only the elements a level has", () => {
    expect(levelElements(LEVEL)).toEqual([
      { element: "bombs", count: 1 },
      { element: "streams", count: 2 },
      { element: "bridges", count: 2 },
    ]);
  });
});
