import type { components } from "../generated/schema";

import { MOCK_ITEMS } from "./mock-catalog";
import type { MockBundle, MockItem } from "./mock-catalog";
import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import type { MockPrice } from "./mock-wallet";

type Loadout = components["schemas"]["Loadout"];

interface Ownership {
  acquiredAt: string;
  source: string;
}

interface ShopState {
  openedAt: number;
  owned: Record<string, Ownership>;
  loadout: Loadout;
  sold: Record<string, number>;
}

const STATE_NAME = "shop";
const DAY_MS = 86_400_000;
// The server still accepts a purchase sent within 10 s after the window (сервер ещё принимает покупку, отправленную в течение 10 с после окна).
const GRACE_MS = 10_000;
const MIN_BUNDLE_SHARE = 0.3;

const initialState = (): ShopState => ({ openedAt: Date.now(), owned: {}, loadout: {}, sold: {} });

let state = loadMockState<ShopState>(STATE_NAME, initialState());

const save = () => saveMockState(STATE_NAME, state);

export const resetMockShop = () => {
  state = initialState();
  clearMockState(STATE_NAME);
};

export const mockShopState = () => state;

export const availableToOf = ({ dropDays }: { dropDays: number | null }) =>
  dropDays === null ? null : state.openedAt + dropDays * DAY_MS;

export const isOnSale = (offer: { dropDays: number | null }, now: number, grace = 0) => {
  const availableTo = availableToOf(offer);
  return availableTo === null || now <= availableTo + grace;
};

export const isPurchasable = (offer: { dropDays: number | null }, now: number) =>
  isOnSale(offer, now, GRACE_MS);

export const stockLeftOf = ({ id, stock }: MockItem) =>
  stock === null ? null : stock - (state.sold[id] ?? 0);

export const isOwned = (itemId: string) => state.owned[itemId] !== undefined;

const amountOf = (price: MockPrice) => ("emeralds" in price ? price.emeralds : price.coins);

const withAmount = (price: MockPrice, amount: number): MockPrice =>
  "emeralds" in price ? { emeralds: amount } : { coins: amount };

const isSameCurrency = (left: MockPrice, right: MockPrice) =>
  "emeralds" in left === "emeralds" in right;

// Owned parts in the bundle's currency are subtracted, down to 30% of its price (SHP-08) (купленные части в валюте набора вычитаются, но не ниже 30% его цены).
export const bundlePriceOf = (bundle: MockBundle): MockPrice => {
  const ownedCost = MOCK_ITEMS.filter(
    (item) =>
      bundle.items.includes(item.id) &&
      isOwned(item.id) &&
      isSameCurrency(item.price, bundle.price),
  ).reduce((sum, item) => sum + amountOf(item.price), 0);
  const floor = Math.ceil(amountOf(bundle.price) * MIN_BUNDLE_SHARE);
  return withAmount(bundle.price, Math.max(floor, amountOf(bundle.price) - ownedCost));
};

export const isSamePrice = (left: MockPrice, right: MockPrice) =>
  isSameCurrency(left, right) && amountOf(left) === amountOf(right);

export const grantItems = (itemIds: readonly string[], source: string, now: number) => {
  itemIds.forEach((itemId) => {
    state.owned[itemId] ??= { acquiredAt: new Date(now).toISOString(), source };
    state.sold[itemId] = (state.sold[itemId] ?? 0) + 1;
  });
  save();
};

export const equip = (change: Loadout) => {
  state.loadout = { ...state.loadout, ...change };
  save();
  return state.loadout;
};
