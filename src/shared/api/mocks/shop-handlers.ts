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
} from "./mock-shop";
import skins from "./mock-skins.json";
import { mockUrl } from "./mock-url";
import { chargePrice, mockWallet, shortOf } from "./mock-wallet";
import type { MockPrice } from "./mock-wallet";

type ShopItemView = components["schemas"]["ShopItemView"];
type Locale = "ru" | "en";

const SKIN_PATH = "/cdn/skins/";
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_GONE = 410;
const HTTP_UNPROCESSABLE = 422;
const TABS = [
  "exclusive",
  "holiday",
  "elements",
  "boards",
  "bundles",
  "profile",
  "effects",
] as const;

const buySchema = z.object({ price: z.number(), currency: z.enum(["coins", "gems"]) });
const equipSchema = z.object({ slot: z.string(), item: z.string().optional() });

interface PurchaseSuccess {
  item: ShopItemView;
  granted: string[];
  wallet: { coins: number; gems: number };
}

interface StoredPurchase {
  body: string;
  answer: PurchaseSuccess;
}

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

let purchases = new Map<string, StoredPurchase>();

export const resetMockPurchases = () => {
  purchases = new Map();
};

const errorResponse = (code: string, status: number, details?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, ...(details === undefined ? {} : { details }) } }, { status });

const localeOf = (request: Request): Locale =>
  request.headers.get("X-Locale")?.startsWith("en") ? "en" : "ru";

const backendWallet = () => ({ coins: mockWallet().coins, gems: mockWallet().emeralds });

const currencyOf = (price: MockPrice) => ("emeralds" in price ? "gems" : "coins");

const amountOf = (price: MockPrice) => ("emeralds" in price ? price.emeralds : price.coins);

const endsAtOf = (offer: { dropDays: number | null }) => {
  const end = availableToOf(offer);
  return end === null ? {} : { endsAt: new Date(end).toISOString() };
};

const itemViewOf = (item: MockItem, locale: Locale): ShopItemView => ({
  key: item.id,
  tab: item.tab,
  kind: item.kind,
  title: item.name[locale],
  description: item.description[locale],
  rarity: item.rarity,
  currency: currencyOf(item.price),
  price: amountOf(item.price),
  owned: isOwned(item.id),
  equipped: mockShopState().loadout[item.kind] === item.id,
  ...(item.isDefault ? { default: true } : {}),
  ...endsAtOf(item),
});

const bundleViewOf = (bundle: MockBundle, locale: Locale): ShopItemView => {
  const price = bundlePriceOf(bundle);
  const partsOwned = bundle.items.filter(isOwned);
  return {
    key: bundle.id,
    tab: "bundles",
    kind: "bundle",
    title: bundle.name[locale],
    description: bundle.description[locale],
    rarity: bundle.rarity,
    currency: currencyOf(price),
    price: amountOf(price),
    fullPrice: amountOf(bundle.basePrice),
    owned: partsOwned.length === bundle.items.length,
    equipped: false,
    parts: bundle.items,
    partsOwned,
    ...endsAtOf(bundle),
  };
};

const shopOf = (locale: Locale, now: number) => {
  const items = [
    ...MOCK_ITEMS.filter((item) => item.isDefault || isOnSale(item, now)).map((item) =>
      itemViewOf(item, locale),
    ),
    ...MOCK_BUNDLES.filter((bundle) => isOnSale(bundle, now)).map((bundle) =>
      bundleViewOf(bundle, locale),
    ),
  ];
  const featured = items.find(({ key }) => key === FEATURED_BUNDLE);
  return {
    serverTime: new Date(now).toISOString(),
    wallet: backendWallet(),
    ...(featured === undefined ? {} : { featured }),
    tabs: TABS.map((key) => ({
      key,
      title: key,
      count: items.filter(({ tab }) => tab === key).length,
    })),
    items,
  };
};

const inventoryOf = (locale: Locale) => ({
  items: MOCK_ITEMS.filter(({ id }) => isOwned(id)).map((item) => itemViewOf(item, locale)),
  equipped: mockShopState().loadout,
});

const purchase = (offer: MockItem | MockBundle, seen: MockPrice, locale: Locale, now: number) => {
  if (!isPurchasable(offer, now)) return errorResponse("offer_ended", HTTP_GONE);
  const isItem = "kind" in offer;
  const missing = (isItem ? [offer.id] : offer.items).filter((id) => !isOwned(id));
  if (missing.length === 0) return errorResponse("already_owned", HTTP_CONFLICT);
  const price = isItem ? offer.price : bundlePriceOf(offer);
  if (!isSamePrice(seen, price)) {
    return errorResponse("price_changed", HTTP_CONFLICT, {
      price: amountOf(price),
      currency: currencyOf(price),
    });
  }
  if (!chargePrice(price)) {
    const code = "emeralds" in price ? "not_enough_gems" : "not_enough_coins";
    return errorResponse(code, HTTP_CONFLICT, {
      need: shortOf(price),
      currency: currencyOf(price),
    });
  }
  grantItems(missing, "shop", now);
  return {
    item: isItem ? itemViewOf(offer, locale) : bundleViewOf(offer, locale),
    granted: missing,
    wallet: backendWallet(),
  };
};

const isEquippable = (kind: string, itemId: string) =>
  itemId === "" ||
  (isOwned(itemId) && MOCK_ITEMS.some((item) => item.id === itemId && item.kind === kind));

export const shopHandlers = [
  http.get(`*${SKIN_PATH}:file`, ({ params }) => {
    const id = String(params.file).replace(/\.json$/, "");
    const skin = Object.entries(skins).find(([skinId]) => skinId === id)?.[1];
    if (skin === undefined) return errorResponse("not_found", HTTP_NOT_FOUND);
    return HttpResponse.json({ id, version: 1, themes: "both", ...skin });
  }),
  http.get(mockUrl("/shop"), ({ request }) =>
    HttpResponse.json(shopOf(localeOf(request), Date.now())),
  ),
  http.post(mockUrl("/shop/items/:key/buy"), async ({ request, params }) => {
    const text = await request.text();
    const parsed = buySchema.safeParse(parseJson(text));
    if (!parsed.success) return errorResponse("validation_failed", HTTP_BAD_REQUEST);
    // A repeat with the same key returns the stored answer and charges nothing (SHP-03) (повтор с тем же ключом возвращает сохранённый ответ и ничего не списывает).
    const idempotencyKey = request.headers.get("Idempotency-Key");
    const body = `${String(params.key)} ${text}`;
    const stored = idempotencyKey === null ? undefined : purchases.get(idempotencyKey);
    if (stored !== undefined) {
      if (stored.body !== body) return errorResponse("idempotency_mismatch", HTTP_CONFLICT);
      return HttpResponse.json(stored.answer);
    }
    const offer =
      MOCK_ITEMS.find(({ id, isDefault }) => id === params.key && !isDefault) ??
      MOCK_BUNDLES.find(({ id }) => id === params.key);
    if (offer === undefined) return errorResponse("item_not_found", HTTP_NOT_FOUND);
    const { price, currency } = parsed.data;
    const seen = currency === "gems" ? { emeralds: price } : { coins: price };
    const result = purchase(offer, seen, localeOf(request), Date.now());
    if (result instanceof Response) return result;
    if (idempotencyKey !== null) purchases.set(idempotencyKey, { body, answer: result });
    return HttpResponse.json(result);
  }),
  http.get(mockUrl("/me/items"), ({ request }) =>
    HttpResponse.json(inventoryOf(localeOf(request))),
  ),
  http.put(mockUrl("/me/equipment"), async ({ request }) => {
    const parsed = equipSchema.safeParse(parseJson(await request.text()));
    if (!parsed.success) return errorResponse("validation_failed", HTTP_BAD_REQUEST);
    const { slot, item = "" } = parsed.data;
    if (!isEquippable(slot, item)) {
      return errorResponse("validation_failed", HTTP_UNPROCESSABLE, {
        fields: { item: "Этого товара у вас нет." },
      });
    }
    equip(slot, item);
    return HttpResponse.json(inventoryOf(localeOf(request)));
  }),
];
