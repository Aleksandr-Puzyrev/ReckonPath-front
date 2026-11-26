import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { fetchAssetJson } from "@shared/api";
import { keyValueStorage } from "@shared/storage";

const inlineImage = /^data:image\/(?:png|jpe?g);base64,/;

const assetSchema = z.looseObject({
  p: z.string().regex(inlineImage).optional(),
  u: z.literal("").optional(),
});

const sourceSchema = z
  .looseObject({
    v: z.string(),
    w: z.number().min(1).max(2048),
    h: z.number().min(1).max(2048),
    fr: z.number().min(1).max(120),
    ip: z.number(),
    op: z.number(),
    layers: z.array(z.record(z.string(), z.unknown())).min(1).max(300),
    assets: z.array(assetSchema).default([]),
  })
  .refine(({ ip, op, fr }) => op > ip && (op - ip) / fr <= 10);

export type ShopAnimationSource = z.infer<typeof sourceSchema>;

const INDEX_KEY = "shop-animation-cache";
const CACHE_SIZE = 6;
const indexSchema = z.array(z.string()).max(CACHE_SIZE);

const readCached = (url: string) => {
  try {
    return sourceSchema.parse(JSON.parse(keyValueStorage.getItem(`${INDEX_KEY}:${url}`) ?? "null"));
  } catch {
    return undefined;
  }
};

const cacheSource = (url: string, source: ShopAnimationSource) => {
  try {
    const index = indexSchema.safeParse(JSON.parse(keyValueStorage.getItem(INDEX_KEY) ?? "[]"));
    const urls = [url, ...(index.data ?? []).filter((entry) => entry !== url)];
    keyValueStorage.setItem(`${INDEX_KEY}:${url}`, JSON.stringify(source));
    keyValueStorage.setItem(INDEX_KEY, JSON.stringify(urls.slice(0, CACHE_SIZE)));
    for (const expired of urls.slice(CACHE_SIZE)) {
      keyValueStorage.removeItem(`${INDEX_KEY}:${expired}`);
    }
  } catch {
    // The downloaded composition can still be played if the disk cache is unavailable.
  }
};

export const shopAnimationOptions = (url: string) =>
  queryOptions({
    queryKey: ["shop-animation", url],
    initialData: () => readCached(url),
    queryFn: async () => {
      const source = sourceSchema.parse(await fetchAssetJson(url));
      cacheSource(url, source);
      return source;
    },
    staleTime: Infinity,
    gcTime: 10 * 60_000,
    meta: { persist: false },
  });

export const useShopAnimation = (url: string) => useQuery(shopAnimationOptions(url));
