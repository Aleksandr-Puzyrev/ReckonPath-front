import type { Bundle, Rarity, Shop, ShopItem, ShopTab } from "@entities/item";

export type ShopTabId = ShopTab["id"] | "bundles";

export type ShopOffer =
  { kind: "item"; item: ShopItem } | { kind: "bundle"; bundle: Bundle; isComplete: boolean };

const TAB_ORDER: readonly ShopTabId[] = [
  "exclusive",
  "holiday",
  "elements",
  "fields",
  "bundles",
  "profile",
  "effects",
];
const EFFECT_SLOTS: ReadonlySet<ShopItem["slot"]> = new Set(["fxClick", "fxReveal", "fxVictory"]);
const RARITY_ORDER: readonly Rarity[] = ["legendary", "epic", "rare", "common"];

const bundleOfferOf = (bundle: Bundle): ShopOffer => ({
  kind: "bundle",
  bundle,
  isComplete: bundle.items.every((id) => bundle.ownedItems.includes(id)),
});

const cardsOfTab = (shop: Shop, tabId: ShopTabId): ShopOffer[] => {
  if (tabId === "bundles") return shop.bundles.map(bundleOfferOf);
  const items = shop.tabs.find(({ id }) => id === tabId)?.items ?? [];
  return items
    .filter(({ slot }) => !EFFECT_SLOTS.has(slot))
    .map((item) => ({ kind: "item", item }));
};

export const isOwnedCard = (card: ShopOffer) =>
  card.kind === "item" ? card.item.owned : card.isComplete;

const offerOf = (card: ShopOffer) => (card.kind === "item" ? card.item : card.bundle);

const rankOf = (card: ShopOffer) => [
  isOwnedCard(card) ? 1 : 0,
  offerOf(card).availableTo === null ? 1 : 0,
  RARITY_ORDER.indexOf(offerOf(card).rarity),
];

const compareCards = (left: ShopOffer, right: ShopOffer) => {
  const leftRank = rankOf(left);
  const rightRank = rankOf(right);
  const index = leftRank.findIndex((value, at) => value !== rightRank[at]);
  return index === -1 ? 0 : (leftRank[index] ?? 0) - (rightRank[index] ?? 0);
};

export const visibleTabsOf = (shop: Shop) =>
  TAB_ORDER.filter((tabId) => cardsOfTab(shop, tabId).length > 0);

export const shopCardsOf = (shop: Shop, tabId: ShopTabId, isOwnedHidden: boolean) =>
  cardsOfTab(shop, tabId)
    .filter((card) => !(isOwnedHidden && isOwnedCard(card)))
    .sort(compareCards);

export const offerKeyOf = (card: ShopOffer) =>
  card.kind === "item" ? card.item.id : card.bundle.id;
