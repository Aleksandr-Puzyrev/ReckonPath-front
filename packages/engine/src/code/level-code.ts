import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";

import { TITLE_MAX_LENGTH } from "../config/engine-config";
import { levelSchema } from "../level/level-schema";
import type { LevelInput } from "../level/level-schema";
import { fnv1a32 } from "../random/random";
import { validateLevel } from "../validator/validate-level";

import { crc8, fromBase64Url, toBase64Url, toHex2 } from "./bytes";

export const CODE_PREFIX = "RP2-";
export const LEGACY_PREFIX = "PELENG1-";
export const MAX_CODE_LENGTH = 600;
const SUPPORTED_VERSION = 2;
const LEGACY_VERSION = 1;
const ID_RADIX = 36;

export type CodeError = "CODE_INVALID" | "CODE_NEWER";
export type DecodeResult = { ok: true; level: LevelInput } | { ok: false; error: CodeError };

const COMPACT_KEYS = {
  n: "title",
  r: "rows",
  c: "cols",
  t: "targets",
  b: "bombs",
  s: "streams",
  g: "bridges",
  h: "heavy",
  k: "rocks",
  f: "fences",
  m: "probeMode",
  l: "moveLimit",
  bc: "beacons",
  by: "buoys",
  fg: "fog",
  or: "targetOrder",
  bh: "bombHint",
} as const;

// Reserved for the author's challenge, not encoded yet (зарезервирован для челленджа автора, пока не кодируется).
const CHALLENGE_KEY = "x";
const VERSION_KEY = "v";

const invalid: DecodeResult = { ok: false, error: "CODE_INVALID" };
const newer: DecodeResult = { ok: false, error: "CODE_NEWER" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Own keys only: `in` would accept `constructor` or `__proto__` (только собственные ключи: `in` пропустит `constructor`).
const isCompactKey = (key: string): key is keyof typeof COMPACT_KEYS =>
  Object.hasOwn(COMPACT_KEYS, key);

const idFor = (payload: string) => `u-${fnv1a32(payload).toString(ID_RADIX)}`;

export const encodeLevel = (level: LevelInput) => {
  const compact: Record<string, unknown> = { [VERSION_KEY]: SUPPORTED_VERSION };
  Object.entries(COMPACT_KEYS).forEach(([short, long]) => {
    const value = level[long];
    if (value !== undefined && value !== null) compact[short] = value;
  });

  const payload = toBase64Url(deflateSync(strToU8(JSON.stringify(compact)), { level: 9 }));
  return `${CODE_PREFIX}${payload}-${toHex2(crc8(strToU8(payload)))}`;
};

const accept = (candidate: Record<string, unknown>): DecodeResult => {
  const parsed = levelSchema.safeParse(candidate);
  if (!parsed.success) return invalid;
  if (validateLevel(parsed.data, { kind: "custom" }).length > 0) return invalid;

  return { ok: true, level: parsed.data };
};

const parseJson = (bytes: Uint8Array | null): unknown => {
  if (bytes === null) return undefined;
  try {
    return JSON.parse(strFromU8(bytes));
  } catch {
    return undefined;
  }
};

const inflate = (bytes: Uint8Array | null) => {
  if (bytes === null) return null;
  try {
    return inflateSync(bytes);
  } catch {
    return null;
  }
};

const decodeCurrent = (body: string): DecodeResult => {
  const separator = body.lastIndexOf("-");
  if (separator <= 0) return invalid;
  const payload = body.slice(0, separator);
  const checksum = body.slice(separator + 1);
  if (checksum !== toHex2(crc8(strToU8(payload)))) return invalid;

  const compact = parseJson(inflate(fromBase64Url(payload)));
  if (!isRecord(compact)) return invalid;
  if (typeof compact.v === "number" && compact.v > SUPPORTED_VERSION) return newer;
  if (compact.v !== SUPPORTED_VERSION) return invalid;

  const level: Record<string, unknown> = { v: SUPPORTED_VERSION, id: idFor(payload) };
  for (const [short, value] of Object.entries(compact)) {
    if (short === VERSION_KEY || short === CHALLENGE_KEY) continue;
    if (!isCompactKey(short)) return newer;
    level[COMPACT_KEYS[short]] = value;
  }
  return accept(level);
};

// The limit counts UTF-16 units; a cut must not split a surrogate pair (лимит в UTF-16 единицах; нельзя разрезать суррогатную пару).
const truncateTitle = (title: string) => {
  const cut = title.slice(0, TITLE_MAX_LENGTH);
  return /[\uD800-\uDBFF]$/.test(cut) ? cut.slice(0, -1) : cut;
};

const decodeLegacy = (payload: string): DecodeResult => {
  const legacy = parseJson(fromBase64Url(payload));
  if (!isRecord(legacy) || legacy.v !== LEGACY_VERSION) return invalid;

  const title = typeof legacy.n === "string" ? { ru: truncateTitle(legacy.n) } : undefined;
  return accept({
    v: SUPPORTED_VERSION,
    id: idFor(payload),
    ...(title === undefined ? {} : { title }),
    rows: legacy.r,
    cols: legacy.c,
    targets: legacy.t,
    fences: legacy.w ?? [],
    streams: legacy.k ?? [],
    probeMode: "distance",
  });
};

export const decodeLevel = (code: string): DecodeResult => {
  const trimmed = code.trim();
  if (trimmed.length > MAX_CODE_LENGTH) return invalid;
  if (trimmed.startsWith(LEGACY_PREFIX)) return decodeLegacy(trimmed.slice(LEGACY_PREFIX.length));
  if (!trimmed.startsWith(CODE_PREFIX)) return invalid;

  return decodeCurrent(trimmed.slice(CODE_PREFIX.length));
};
