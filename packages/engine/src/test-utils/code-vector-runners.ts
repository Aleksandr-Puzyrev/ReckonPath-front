import { strToU8 } from "fflate";
import { z } from "zod";

import { crc8, toHex2 } from "../code/bytes";
import { decodeLevel, encodeLevel } from "../code/level-code";

import { matchVectorSchema, simulateMatch } from "./simulate-match";
import { levelVectorSchema } from "./vector-schemas";
import type { VectorRunner } from "./vector-schemas";

const crc8VectorSchema = z.object({ input: z.string(), expect: z.string() });

const runCrc8: VectorRunner = (raw) => {
  const vector = crc8VectorSchema.parse(raw);
  expect(toHex2(crc8(strToU8(vector.input)))).toBe(vector.expect);
};

const codeDecodeVectorSchema = z.object({
  code: z.string(),
  expect: z.union([
    z.object({ level: z.unknown() }),
    z.object({ error: z.enum(["CODE_INVALID", "CODE_NEWER"]) }),
  ]),
});

const runCodeDecode: VectorRunner = (raw) => {
  const vector = codeDecodeVectorSchema.parse(raw);
  const expected =
    "level" in vector.expect
      ? { ok: true, level: vector.expect.level }
      : { ok: false, error: vector.expect.error };
  expect(decodeLevel(vector.code)).toEqual(expected);
};

const runRoundTrip: VectorRunner = (raw) => {
  const { level } = levelVectorSchema.parse(raw);
  const code = encodeLevel(level);
  const decoded = decodeLevel(code);
  if (!decoded.ok) throw new Error(`${code} failed with ${decoded.error}`);
  const { id, ...rest } = decoded.level;
  expect(id).toMatch(/^u-[0-9a-z]+$/);
  const { id: _sourceId, ...expected } = level;
  expect(rest).toEqual(expected);
};

const runMatch: VectorRunner = (raw) => {
  const vector = matchVectorSchema.parse(raw);
  expect(simulateMatch(vector)).toEqual(vector.expect);
};

export const CODE_VECTOR_RUNNERS = {
  crc8: runCrc8,
  codeDecode: runCodeDecode,
  codeRoundTrip: runRoundTrip,
  match: runMatch,
};
