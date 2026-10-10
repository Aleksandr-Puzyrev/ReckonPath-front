import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import type { components } from "../generated/schema";

import { FEATURED_BUNDLE, MOCK_BUNDLES, MOCK_ITEMS } from "./mock-catalog";
import type { MockBundle, MockItem } from "./mock-catalog";
import {
  availableToOf,
  bundlePriceOf,
  equip,
  grantItems,
  isOnSale,
  isOwned,
  isPurchasable,
  isSamePrice,
  mockShopState,
  stockLeftOf,
} from "./mock-shop";
import skins from "./mock-skins.json";
import { MOCK_API_ORIGIN, mockUrl } from "./mock-url";
import { chargePrice, mockWallet, shortOf } from "./mock-wallet";
import type { MockPrice } from "./mock-wallet";

type ShopItem = components["schemas"]["ShopItem"];
type Loadout = components["schemas"]["Loadout"];
type Locale = "ru" | "en";

const CACHE_TTL_SEC = 300;
const SKIN_PATH = "/cdn/skins/";
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const TAB_ORDER = ["exclusive", "holiday", "elements", "fields", "profile", "effects"] as const;
const SLOTS: ReadonlySet<string> = new Set([
  "field",
  "fence",
  "stream",
  "rock",
  "x2",
  "bridge",
  "bomb",
  "target",
  "avatar",
  "frame",
  "badges",
  "title",
  "fxClick",
  "fxReveal",
  "fxVictory",
] satisfies components["schemas"]["Slot"][]);

const priceSchema = z.union([
  z.object({ emeralds: z.number() }).strict(),
  z.object({ coins: z.number() }).strict(),
]);
const purchaseSchema = z.union([
  z.object({ itemId: z.string(), expectedPrice: priceSchema }),
  z.object({ bundleId: z.string(), expectedPrice: priceSchema }),
]);
const MAX_BADGES = 3;
const loadoutSchema = z.record(
  z.string(),
  z.union([z.string(), z.null(), z.array(z.string()).max(MAX_BADGES)]),
);

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

interface PurchaseSuccess {
  purchaseId: string;
  granted: string[];
  wallet: { emeralds: number; coins: number };
}

interface StoredPurchase {
  body: string;
  answer: PurchaseSuccess;
}

let purchases = new Map<string, StoredPurchase>();
let purchaseCount = 0;

export const resetMockPurchases = () => {
  purchases = new Map();
  purchaseCount = 0;
};

const errorResponse = (code: string, status: number, details?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, ...(details === undefined ? {} : { details }) } }, { status });

const localeOf = (request: Request): Locale =>
  request.headers.get("X-Locale")?.startsWith("en") ? "en" : "ru";

const isoOrNull = (time: number | null) => (time === null ? null : new Date(time).toISOString());

const isEquipped = ({ id, slot }: MockItem) => {
  const equipped = mockShopState().loadout[slot];
  return Array.isArray(equipped) ? equipped.includes(id) : equipped === id;
};

const descriptionOf = (item: MockItem, locale: Locale) => ({
  type: item.type,
  rarity: item.rarity,
  name: item.name[locale],
  description: item.description[locale],
  preview: "",
  package: {
    url: Object.hasOwn(skins, item.id) ? `${MOCK_API_ORIGIN}${SKIN_PATH}${item.id}.json` : "",
    sha256: "",
    version: 1,
  },
});

const shopItemOf = (item: MockItem, locale: Locale): ShopItem => ({
  ...descriptionOf(item, locale),
  id: item.id,
  slot: item.slot,
  price: item.price,
  availableTo: isoOrNull(availableToOf(item)),
  stockLeft: stockLeftOf(item),
  owned: isOwned(item.id),
  equipped: isEquipped(item),
  visibleInMatch: item.visibleInMatch,
});

const bundleOf = (bundle: MockBundle, locale: Locale) => ({
  id: bundle.id,
  name: bundle.name[locale],
  description: bundle.description[locale],
  rarity: bundle.rarity,
  preview: "",
  items: bundle.items,
  basePrice: bundle.basePrice,
  price: bundlePriceOf(bundle),
  ownedItems: bundle.items.filter(isOwned),
  availableTo: isoOrNull(availableToOf(bundle)),
});

const shopOf = (locale: Locale, now: number) => {
  const onSale = MOCK_ITEMS.filter((item) => isOnSale(item, now) && stockLeftOf(item) !== 0);
  const featured = MOCK_BUNDLES.find(({ id }) => id === FEATURED_BUNDLE);
  const featuredEnd = featured === undefined ? null : availableToOf(featured);
  return {
    featured:
      featured === undefined || featuredEnd === null || !isOnSale(featured, now)
        ? null
        : {
            id: featured.id,
            image: "",
            title: featured.name[locale],
            subtitle: featured.description[locale],
            endsAt: new Date(featuredEnd).toISOString(),
            target: { bundle: featured.id },
          },
    tabs: TAB_ORDER.map((id) => ({
      id,
      items: onSale.filter(({ tab }) => tab === id).map((item) => shopItemOf(item, locale)),
    })).filter(({ items }) => items.length > 0),
    bundles: MOCK_BUNDLES.filter((bundle) => isOnSale(bundle, now)).map((bundle) =>
      bundleOf(bundle, locale),
    ),
    cacheTtlSec: CACHE_TTL_SEC,
  };
};

const purchase = (offer: MockItem | MockBundle, expectedPrice: MockPrice, now: number) => {
  if (!isPurchasable(offer, now)) return errorResponse("OFFER_ENDED", HTTP_UNPROCESSABLE);
  const isItem = "slot" in offer;
  if (isItem && stockLeftOf(offer) === 0) return errorResponse("SOLD_OUT", HTTP_UNPROCESSABLE);
  const missing = isItem
    ? [offer.id].filter((id) => !isOwned(id))
    : offer.items.filter((id) => !isOwned(id));
  if (missing.length === 0) return errorResponse("ALREADY_OWNED", HTTP_CONFLICT);
  const price = isItem ? offer.price : bundlePriceOf(offer);
  if (!isSamePrice(expectedPrice, price)) {
    return errorResponse("PRICE_CHANGED", HTTP_UNPROCESSABLE, { price });
  }
  if (!chargePrice(price)) {
    return errorResponse("INSUFFICIENT_FUNDS", HTTP_UNPROCESSABLE, { need: shortOf(price) });
  }
  grantItems(missing, "shop", now);
  purchaseCount += 1;
  return { purchaseId: `purchase_${purchaseCount}`, granted: missing, wallet: mockWallet() };
};

const isEquippable = (slot: string, value: string | null | string[]) => {
  if (value === null) return true;
  const ids = Array.isArray(value) ? value : [value];
  return ids.every(
    (id) => isOwned(id) && MOCK_ITEMS.some((item) => item.id === id && item.slot === slot),
  );
};

export const shopHandlers = [
  http.get(`*${SKIN_PATH}:file`, ({ params }) => {
    const id = String(params.file).replace(/\.json$/, "");
    const item = MOCK_ITEMS.find((candidate) => candidate.id === id);
    const skin = Object.entries(skins).find(([skinId]) => skinId === id)?.[1];
    if (item === undefined || skin === undefined) return errorResponse("NOT_FOUND", HTTP_NOT_FOUND);
    return HttpResponse.json({ id, type: item.type, version: 1, themes: "both", ...skin });
  }),
  http.get(mockUrl("/shop"), ({ request }) =>
    HttpResponse.json(shopOf(localeOf(request), Date.now())),
  ),
  http.post(mockUrl("/shop/purchase"), async ({ request }) => {
    const text = await request.text();
    const key = request.headers.get("Idempotency-Key");
    const parsed = purchaseSchema.safeParse(parseJson(text));
    if (key === null || !parsed.success) return errorResponse("VALIDATION", HTTP_BAD_REQUEST);
    const body = parsed.data;
    // A repeat with the same key returns the stored answer and charges nothing (SHP-03) (повтор с тем же ключом возвращает сохранённый ответ и ничего не списывает).
    const stored = purchases.get(key);
    if (stored !== undefined) {
      if (stored.body !== text) return errorResponse("IDEMPOTENCY_MISMATCH", HTTP_CONFLICT);
      return HttpResponse.json(stored.answer);
    }
    const offer =
      "itemId" in body
        ? MOCK_ITEMS.find(({ id }) => id === body.itemId)
        : MOCK_BUNDLES.find(({ id }) => id === body.bundleId);
    if (offer === undefined) return errorResponse("NOT_FOUND", HTTP_NOT_FOUND);
    const result = purchase(offer, body.expectedPrice, Date.now());
    if (result instanceof Response) return result;
    purchases.set(key, { body: text, answer: result });
    return HttpResponse.json(result);
  }),
  http.get(mockUrl("/inventory"), ({ request }) => {
    const locale = localeOf(request);
    const { owned } = mockShopState();
    return HttpResponse.json({
      items: MOCK_ITEMS.filter(({ id }) => owned[id] !== undefined).map((item) => ({
        itemId: item.id,
        slot: item.slot,
        acquiredAt: owned[item.id]?.acquiredAt,
        source: owned[item.id]?.source,
        item: descriptionOf(item, locale),
      })),
    });
  }),
  http.put(mockUrl("/loadout"), async ({ request }) => {
    const parsed = loadoutSchema.safeParse(parseJson(await request.text()));
    if (!parsed.success) return errorResponse("VALIDATION", HTTP_BAD_REQUEST);
    const change = parsed.data;
    const isValid = Object.entries(change).every(
      ([slot, value]) => SLOTS.has(slot) && isEquippable(slot, value),
    );
    if (!isValid) return errorResponse("NOT_OWNED", HTTP_UNPROCESSABLE);
    // Validated above: every key is a slot and every value an owned item of it (проверено выше: каждый ключ — слот, каждое значение — купленный предмет этого слота).
    return HttpResponse.json(equip(change as Loadout));
  }),
];
