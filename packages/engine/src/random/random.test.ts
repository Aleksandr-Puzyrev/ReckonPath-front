import * as fc from "fast-check";

import { fnv1a32, mulberry32, randInt, rngFromKey } from "./random";

describe("fnv1a32", () => {
  test.each([
    ["", 0x811c9dc5],
    ["a", 0xe40c292c],
    ["foobar", 0xbf9cf968],
  ])("matches the published reference for %j", (input, expected) => {
    expect(fnv1a32(input)).toBe(expected);
  });

  test("hashes UTF-8 bytes, not UTF-16 code units", () => {
    expect(fnv1a32("é")).toBe(0x1e9de8c1);
  });
});

describe("mulberry32", () => {
  test("always returns numbers in [0, 1)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0xffffffff }), (seed) => {
        const rng = mulberry32(seed);
        for (let step = 0; step < 20; step += 1) {
          const value = rng();
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(1);
        }
      }),
    );
  });

  test("is reproducible for the same key", () => {
    const first = rngFromKey("2026-10-01");
    const second = rngFromKey("2026-10-01");
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });
});

describe("randInt", () => {
  test("stays within the inclusive bounds", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.integer({ min: -50, max: 50 }),
        fc.nat(20),
        (seed, min, span) => {
          const rng = mulberry32(seed);
          const value = randInt(rng, min, min + span);
          expect(value).toBeGreaterThanOrEqual(min);
          expect(value).toBeLessThanOrEqual(min + span);
          expect(Number.isInteger(value)).toBe(true);
        },
      ),
    );
  });
});
