import { bundleOfferOf } from "@entities/item";
import type { Shop, ShopOffer } from "@entities/item";

export const allItemsOf = (shop: Shop) => shop.tabs.flatMap(({ items }) => items);

export const findOffer = (shop: Shop, key: string): ShopOffer | null => {
  const item = allItemsOf(shop).find(({ id }) => id === key);
  if (item !== undefined) return { kind: "item", item };
  const bundle = shop.bundles.find(({ id }) => id === key);
  return bundle === undefined ? null : bundleOfferOf(bundle);
};

export const featuredKeyOf = (featured: NonNullable<Shop["featured"]>) =>
  "bundle" in featured.target ? featured.target.bundle : featured.target.item;
