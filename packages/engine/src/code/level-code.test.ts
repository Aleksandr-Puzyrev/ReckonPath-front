import * as fc from "fast-check";
import { deflateSync, strToU8 } from "fflate";

import type { LevelInput } from "../level/level-schema";

import { crc8, fromBase64Url, toBase64Url, toHex2 } from "./bytes";
import { CODE_PREFIX, LEGACY_PREFIX, decodeLevel, encodeLevel } from "./level-code";

const level: LevelInput = {
  v: 2,
  id: "c-1",
  rows: 5,
  cols: 5,
  targets: [[4, 4]],
  probeMode: "distance",
};

const rp2 = (payload: unknown) => {
  const body = toBase64Url(deflateSync(strToU8(JSON.stringify(payload))));
  return `${CODE_PREFIX}${body}-${toHex2(crc8(strToU8(body)))}`;
};

const legacy = (payload: unknown) =>
  `${LEGACY_PREFIX}${toBase64Url(strToU8(JSON.stringify(payload)))}`;

describe("base64url", () => {
  test("round-trips any bytes", () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 64 }), (bytes) => {
        expect(fromBase64Url(toBase64Url(bytes))).toEqual(bytes);
      }),
    );
  });

  test("uses the url alphabet without padding", () => {
    expect(toBase64Url(Uint8Array.from([0xfb, 0xff]))).toBe("-_8");
  });

  test("rejects characters outside the alphabet and impossible lengths", () => {
    expect(fromBase64Url("ab+c")).toBeNull();
    expect(fromBase64Url("abcde")).toBeNull();
  });
});

describe("level codes", () => {
  test("encodes with the RP2 prefix and a two-character crc", () => {
    expect(encodeLevel(level)).toMatch(/^RP2-[A-Za-z0-9_-]+-[0-9a-f]{2}$/);
  });

  test("the same payload always gets the same id", () => {
    const first = decodeLevel(encodeLevel(level));
    const second = decodeLevel(` ${encodeLevel({ ...level, id: "other" })}\n`);
    expect(first.ok && second.ok && first.level.id === second.level.id).toBe(true);
  });

  test.each([
    ["missing crc", `${CODE_PREFIX}abc`],
    ["bad base64", rp2({ v: 2 }).replace(/^RP2-./, "RP2-*")],
    ["not an object", rp2([2])],
    ["version not a number", rp2({ v: "2", r: 5, c: 5, t: [[4, 4]] })],
    ["version below 2", rp2({ v: 1, r: 5, c: 5, t: [[4, 4]] })],
    ["schema failure", rp2({ v: 2, r: "5", c: 5, t: [[4, 4]] })],
    ["legacy not json", `${LEGACY_PREFIX}AAAA`],
    ["legacy wrong version", legacy({ v: 2, r: 5, c: 5, t: [[4, 4]] })],
  ])("%s is CODE_INVALID", (_name, code) => {
    expect(decodeLevel(code)).toEqual({ ok: false, error: "CODE_INVALID" });
  });

  test.each([
    ["newer version", rp2({ v: 3 })],
    ["unknown key", rp2({ v: 2, r: 5, c: 5, t: [[4, 4]], m: "distance", zz: 1 })],
    ["prototype key", rp2({ v: 2, r: 5, c: 5, t: [[4, 4]], m: "distance", toString: 1 })],
  ])("%s is CODE_NEWER", (_name, code) => {
    expect(decodeLevel(code)).toEqual({ ok: false, error: "CODE_NEWER" });
  });

  test("a legacy code without a title or walls decodes", () => {
    const decoded = decodeLevel(legacy({ v: 1, r: 5, c: 5, t: [[4, 4]] }));
    expect(decoded).toMatchObject({ ok: true, level: { fences: [], streams: [] } });
    expect(decoded.ok && decoded.level.title).toBeUndefined();
  });
});
