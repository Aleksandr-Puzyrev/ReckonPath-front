import type { Bundle, Shop, ShopItem } from "@entities/item";

import { shopCardsOf, visibleTabsOf } from "./shop-cards";

const shopItem = (overrides: Partial<ShopItem>): ShopItem => ({
  id: "item",
  type: "FIELD",
  slot: "field",
  rarity: "common",
  name: "Item",
  description: "",
  preview: "",
  package: { url: "", sha256: "", version: 1 },
  price: { emeralds: 100 },
  availableTo: null,
  stockLeft: null,
  owned: false,
  equipped: false,
  visibleInMatch: true,
  ...overrides,
});

const bundle = (overrides: Partial<Bundle>): Bundle => ({
  id: "set",
  name: "Set",
  description: "",
  rarity: "rare",
  preview: "",
  items: ["a", "b"],
  basePrice: { emeralds: 900 },
  price: { emeralds: 560 },
  ownedItems: [],
  availableTo: null,
  ...overrides,
});

const shopOf = (overrides: Partial<Shop>): Shop => ({
  featured: null,
  tabs: [],
  bundles: [],
  cacheTtlSec: 300,
  ...overrides,
});

const idsOf = (shop: Shop, isOwnedHidden = false) =>
  shopCardsOf(shop, "fields", isOwnedHidden).map((card) =>
    card.kind === "item" ? card.item.id : card.bundle.id,
  );

describe("visibleTabsOf", () => {
  test("lists non-empty tabs in the shop order with bundles after boards", () => {
    const shop = shopOf({
      tabs: [
        { id: "profile", items: [shopItem({ id: "frame", slot: "frame" })] },
        { id: "fields", items: [shopItem({})] },
      ],
      bundles: [bundle({})],
    });

    expect(visibleTabsOf(shop)).toEqual(["fields", "bundles", "profile"]);
  });

  test("hides a tab that has only effects (decision 0022 #6)", () => {
    const shop = shopOf({
      tabs: [
        { id: "effects", items: [shopItem({ slot: "fxClick" })] },
        { id: "holiday", items: [shopItem({ slot: "fxVictory" })] },
      ],
    });

    expect(visibleTabsOf(shop)).toEqual([]);
  });
});

describe("shopCardsOf", () => {
  test("puts limited first, then rarer, and owned last", () => {
    const shop = shopOf({
      tabs: [
        {
          id: "fields",
          items: [
            shopItem({ id: "common" }),
            shopItem({ id: "owned", rarity: "legendary", owned: true }),
            shopItem({ id: "epic", rarity: "epic" }),
            shopItem({ id: "limited", availableTo: "2026-10-16T12:00:00Z" }),
          ],
        },
      ],
    });

    expect(idsOf(shop)).toEqual(["limited", "epic", "common", "owned"]);
  });

  test("hides owned items on request", () => {
    const shop = shopOf({
      tabs: [
        { id: "fields", items: [shopItem({ id: "new" }), shopItem({ id: "mine", owned: true })] },
      ],
    });

    expect(idsOf(shop, true)).toEqual(["new"]);
  });

  test("hides effects inside other tabs", () => {
    const shop = shopOf({
      tabs: [
        {
          id: "fields",
          items: [shopItem({ id: "board" }), shopItem({ id: "fx", slot: "fxReveal" })],
        },
      ],
    });

    expect(idsOf(shop)).toEqual(["board"]);
  });

  test("marks a bundle with every part owned as complete and puts it last", () => {
    const shop = shopOf({
      bundles: [
        bundle({ id: "done", ownedItems: ["a", "b"] }),
        bundle({ id: "open", ownedItems: ["a"] }),
      ],
    });

    const cards = shopCardsOf(shop, "bundles", false);

    expect(
      cards.map((card) => (card.kind === "bundle" ? [card.bundle.id, card.isComplete] : [])),
    ).toEqual([
      ["open", false],
      ["done", true],
    ]);
  });
});
