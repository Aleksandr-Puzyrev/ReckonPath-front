import type { components } from "@shared/api";

export type ShopCatalog = components["schemas"]["ShopCatalog"];
export type ShopItemView = components["schemas"]["ShopItemView"];
export type BackendInventory = components["schemas"]["Inventory"];
export type ShopKind = components["schemas"]["ShopKind"];
export type ShopCurrency = components["schemas"]["ShopCurrency"];
export type Price = components["schemas"]["Price"];
export type Rarity = components["schemas"]["ShopRarity"];

export type Slot =
  | "field"
  | "fence"
  | "stream"
  | "rock"
  | "x2"
  | "bridge"
  | "bomb"
  | "target"
  | "buoy"
  | "beacon"
  | "number"
  | "avatar"
  | "frame"
  | "title"
  | "fxClick"
  | "fxReveal"
  | "fxVictory";

export type Loadout = Partial<Record<Slot, string>>;

export interface ShopItem {
  id: string;
  slot: Slot;
  rarity: Rarity;
  name: string;
  description: string;
  preview: string;
  skinUrl: string;
  price: Price;
  availableTo: string | null;
  owned: boolean;
  equipped: boolean;
  visibleInMatch: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  preview: string;
  items: string[];
  basePrice: Price;
  price: Price;
  ownedItems: string[];
  availableTo: string | null;
}

export type ShopTabId = "exclusive" | "holiday" | "elements" | "fields" | "profile" | "effects";

export interface ShopTab {
  id: ShopTabId;
  items: ShopItem[];
}

export interface Featured {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  endsAt: string;
  target: { bundle: string } | { item: string };
}

export interface Shop {
  featured: Featured | null;
  tabs: ShopTab[];
  bundles: Bundle[];
}

export interface InventoryEntry {
  itemId: string;
  slot: Slot;
  item: Pick<ShopItem, "name" | "description" | "rarity" | "preview" | "skinUrl">;
}

export interface Inventory {
  items: InventoryEntry[];
  loadout: Loadout;
}
