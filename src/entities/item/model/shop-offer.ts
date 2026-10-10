import type { Bundle, Price, Rarity, ShopItem, Slot } from "./item-type";

export type ShopOffer =
  { kind: "item"; item: ShopItem } | { kind: "bundle"; bundle: Bundle; isComplete: boolean };

export const bundleOfferOf = (bundle: Bundle): ShopOffer => ({
  kind: "bundle",
  bundle,
  isComplete: bundle.items.every((id) => bundle.ownedItems.includes(id)),
});

export const offerKeyOf = (offer: ShopOffer) =>
  offer.kind === "item" ? offer.item.id : offer.bundle.id;

export type OfferMark = "owned" | "equipped" | "complete";

export interface OfferView {
  name: string;
  slot: Slot | "bundle";
  rarity: Rarity;
  preview: string;
  availableTo: string | null;
  isVisibleInMatch: boolean;
  price: Price;
  mark: OfferMark | null;
}

const itemMarkOf = ({
  owned,
  equipped,
}: {
  owned: boolean;
  equipped: boolean;
}): OfferMark | null => {
  if (equipped) return "equipped";
  return owned ? "owned" : null;
};

export const offerViewOf = (card: ShopOffer): OfferView => {
  if (card.kind === "bundle") {
    const { bundle, isComplete } = card;
    return {
      name: bundle.name,
      slot: "bundle",
      rarity: bundle.rarity,
      preview: bundle.preview,
      availableTo: bundle.availableTo,
      isVisibleInMatch: false,
      price: bundle.price,
      mark: isComplete ? "complete" : null,
    };
  }
  const { item } = card;
  return {
    name: item.name,
    slot: item.slot,
    rarity: item.rarity,
    preview: item.preview,
    availableTo: item.availableTo,
    isVisibleInMatch: item.visibleInMatch,
    price: item.price,
    mark: itemMarkOf(item),
  };
};
