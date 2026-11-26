import type * as ExpoCrypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";

import { levelFromBackend, levelSchema } from "@reckon-path/engine";

import { serverClockOffset } from "@shared/api";
import type { components } from "@shared/api";
import { toCamelKeys } from "@shared/lib";

import type { CampaignPack, PendingAttempt } from "./offline-campaign-store";

type PackResponse = components["schemas"]["OfflineCampaignPack"];
type EncryptedLevel = CampaignPack["levels"][number];

export const offlineNow = (pack?: CampaignPack) =>
  Date.now() + (pack?.clockOffset ?? serverClockOffset());
export const isPackCurrent = (pack: CampaignPack, now = offlineNow(pack)) =>
  Date.parse(pack.expiresAt) > now;

const SYNC_GRACE_MS = 24 * 60 * 60 * 1000;
export const canResumeOffline = (pack: CampaignPack, now = offlineNow(pack)) =>
  Date.parse(pack.expiresAt) + SYNC_GRACE_MS > now;

export const nextOfflineLevel = (pack: CampaignPack, pending: readonly PendingAttempt[]) => {
  const wins = new Set([
    ...pack.completed,
    ...pending.filter(({ won, packId }) => won && packId === pack.packId).map(({ level }) => level),
  ]);
  return pack.levels.find(({ number }) => !wins.has(number))?.number;
};

const keyName = (packId: string) => `campaign-offline-key.${packId}`;

export const discardPackKey = (packId: string) => SecureStore.deleteItemAsync(keyName(packId));

export const savePack = async ({
  key,
  alg,
  levels,
  packId,
  expiresAt,
}: PackResponse): Promise<CampaignPack | null> => {
  if (levels.length === 0) return null;
  if (
    alg !== "A256GCM" ||
    !z.uuid().safeParse(packId).success ||
    !key ||
    !Number.isFinite(Date.parse(expiresAt))
  ) {
    throw new Error("Invalid offline campaign pack");
  }
  await SecureStore.setItemAsync(keyName(packId), key);
  return { packId, expiresAt, levels, completed: [], clockOffset: serverClockOffset() };
};

const point = z.tuple([z.number().int(), z.number().int()]);
const cells = z.array(point);
const payload = z.object({
  number: z.number().int(),
  version: z.number().int(),
  title: z.string(),
  level: z.object({
    rows: z.number().int(),
    cols: z.number().int(),
    terrain: z.array(z.string()),
    targets: cells,
    fences: z.array(z.tuple([point, point])).nullish(),
    bombs: cells.nullish(),
    buoys: cells.nullish(),
    beacons: cells.nullish(),
    fog: z.number().int().optional(),
    order: z.boolean().optional(),
    noBombHint: z.boolean().optional(),
    mode: z.enum(["number", "hot_cold", "course"]),
    limit: z.number().int(),
    stars: z.array(z.number().int()),
  }),
});

const utf8Of = (bytes: Uint8Array) =>
  decodeURIComponent(
    Array.from(bytes, (byte) => `%${byte.toString(16).padStart(2, "0")}`).join(""),
  );

const loadCrypto = (): typeof ExpoCrypto => {
  // AES is needed only when a downloaded level is opened.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-crypto") as typeof ExpoCrypto;
};

export const decryptOfflineLevel = async (packId: string, entry: EncryptedLevel) => {
  const { AESEncryptionKey, AESSealedData, aesDecryptAsync } = loadCrypto();
  const encoded = await SecureStore.getItemAsync(keyName(packId));
  if (encoded === null) throw new Error("Offline campaign key missing");
  const key = await AESEncryptionKey.import(encoded, "base64");
  const sealed = AESSealedData.fromParts(entry.nonce, entry.data);
  const aad = Uint8Array.from(`${packId}:${entry.number}:${entry.version}`, (ch) =>
    ch.charCodeAt(0),
  );
  const bytes = await aesDecryptAsync(sealed, key, { additionalData: aad });
  const decoded = payload.parse(toCamelKeys(JSON.parse(utf8Of(bytes))));
  if (entry.number !== decoded.number || entry.version !== decoded.version)
    throw new Error("Offline level identity mismatch");
  const { fences, bombs, buoys, beacons, ...level } = decoded.level;
  return {
    title: decoded.title,
    level: levelSchema.parse(
      levelFromBackend(
        {
          ...level,
          ...(fences == null ? {} : { fences }),
          ...(bombs == null ? {} : { bombs }),
          ...(buoys == null ? {} : { buoys }),
          ...(beacons == null ? {} : { beacons }),
        },
        `c-${entry.number}`,
      ),
    ),
  };
};
