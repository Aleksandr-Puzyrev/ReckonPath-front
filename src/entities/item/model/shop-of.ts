import { apiAssetUrl } from "@shared/api";

import { priceOf } from "./backend-price";
import type {
  Bundle,
  Featured,
  Shop,
  ShopCatalog,
  ShopItem,
  ShopItemView,
  ShopTabId,
} from "./item-type";
import { isVisibleInMatch, slotOfKind } from "./kind-slots";

const TAB_OF = {
  exclusive: "exclusive",
  holiday: "holiday",
  elements: "elements",
  boards: "fields",
  profile: "profile",
  effects: "effects",
  bundles: null,
} as const satisfies Record<ShopItemView["tab"], ShopTabId | null>;
const TAB_ORDER: readonly ShopTabId[] = [
  "exclusive",
  "holiday",
  "elements",
  "fields",
  "profile",
  "effects",
];

export const shopItemOf = (view: ShopItemView): ShopItem | null => {
  const slot = slotOfKind(view.kind);
  if (slot === null) return null;
  return {
    id: view.key,
    slot,
    rarity: view.rarity,
    name: view.title,
    description: view.description,
    preview: apiAssetUrl(view.image ?? ""),
    skinUrl: "",
    price: priceOf(view.price, view.currency),
    availableTo: view.endsAt ?? null,
    owned: view.owned,
    equipped: view.equipped,
    visibleInMatch: isVisibleInMatch(slot),
  };
};

const bundleOf = (view: ShopItemView): Bundle => ({
  id: view.key,
  name: view.title,
  description: view.description,
  rarity: view.rarity,
  preview: apiAssetUrl(view.image ?? ""),
  items: view.parts ?? [],
  basePrice: priceOf(view.fullPrice ?? view.price, view.currency),
  price: priceOf(view.price, view.currency),
  ownedItems: view.partsOwned ?? [],
  availableTo: view.endsAt ?? null,
});

const featuredOf = (view: ShopItemView | undefined): Featured | null => {
  if (view?.endsAt === undefined) return null;
  return {
    id: view.key,
    image: apiAssetUrl(view.image ?? ""),
    title: view.title,
    subtitle: view.description,
    endsAt: view.endsAt,
    target: view.kind === "bundle" ? { bundle: view.key } : { item: view.key },
  };
};

const tabItemsOf = (views: readonly ShopItemView[], tabId: ShopTabId) =>
  views.flatMap((view) => {
    const item = TAB_OF[view.tab] === tabId ? shopItemOf(view) : null;
    return item === null ? [] : [item];
  });

export const shopOf = ({ items, featured }: ShopCatalog): Shop => {
  const onSale = items.filter((view) => view.default !== true);
  return {
    featured: featuredOf(featured),
    tabs: TAB_ORDER.map((id) => ({ id, items: tabItemsOf(onSale, id) })).filter(
      (tab) => tab.items.length > 0,
    ),
    bundles: onSale.filter(({ kind }) => kind === "bundle").map(bundleOf),
  };
};
