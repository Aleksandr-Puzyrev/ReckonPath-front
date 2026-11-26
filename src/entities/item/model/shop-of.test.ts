import { toCamelKeys } from "@shared/lib";
import { darkTheme, lightTheme } from "@shared/theme";

import type { ShopCatalog, ShopItemView } from "./item-type";
import { shopItemOf, shopOf } from "./shop-of";

const view = (fields: Partial<ShopItemView> = {}): ShopItemView => ({
  key: "night",
  tab: "exclusive",
  kind: "board",
  title: "Night signal",
  description: "Neon",
  rarity: "legendary",
  currency: "gems",
  price: 1680,
  owned: false,
  equipped: false,
  ...fields,
});

const catalogOf = (items: ShopItemView[], featured?: ShopItemView): ShopCatalog => ({
  serverTime: "2026-11-02T12:00:00Z",
  wallet: { coins: 0, gems: 0 },
  tabs: [],
  items,
  ...(featured === undefined ? {} : { featured }),
});

const bundle = view({
  key: "set",
  tab: "bundles",
  kind: "bundle",
  price: 456,
  fullPrice: 2340,
  parts: ["creek", "fence_neon"],
  partsOwned: ["creek"],
  endsAt: "2026-11-08T12:00:00Z",
});

describe("shopItemOf", () => {
  test("turns a backend item into a shop item with its slot and price", () => {
    expect(shopItemOf(view())).toEqual({
      id: "night",
      slot: "field",
      rarity: "legendary",
      name: "Night signal",
      description: "Neon",
      preview: "",
      skinUrl: "",
      price: { emeralds: 1680 },
      availableTo: null,
      owned: false,
      equipped: false,
      visibleInMatch: true,
    });
  });

  test.each([
    ["heavy", "x2"],
    ["marker", "target"],
    ["tap", "fxClick"],
    ["reveal", "fxReveal"],
    ["win", "fxVictory"],
    ["buoy", "buoy"],
  ] as const)("puts the %s kind in the %s slot", (kind, slot) => {
    expect(shopItemOf(view({ kind }))?.slot).toBe(slot);
  });

  test("prices coins as coins", () => {
    expect(shopItemOf(view({ currency: "coins", price: 4200 }))?.price).toEqual({ coins: 4200 });
  });

  test("keeps the end of the sale", () => {
    const endsAt = "2026-11-08T12:00:00Z";

    expect(shopItemOf(view({ endsAt }))?.availableTo).toBe(endsAt);
  });

  test("marks effects as not visible in a match (decision 0055 #4)", () => {
    expect(shopItemOf(view({ kind: "win" }))?.visibleInMatch).toBe(false);
  });

  test("resolves the image against the API address", () => {
    expect(shopItemOf(view({ image: "/shop/images/ab.png" }))?.preview).toMatch(
      /\/v1\/shop\/images\/ab\.png$/,
    );
  });

  test("uses the server Lottie file and preserves the exact layer names for each theme", () => {
    const animation = `/shop/files/${"a".repeat(64)}.json`;
    const light = lightTheme.colors.bg.base;
    const dark = darkTheme.colors.bg.base;
    const fields = toCamelKeys({
      render: "lottie",
      animation,
      loop: true,
      layer_colors: { color_glow: light },
      dark: { animation, layer_colors: { color_glow: dark } },
    }) as Partial<ShopItemView>;
    const effect = shopItemOf(view({ kind: "tap", ...fields }))?.animation;

    expect(effect).toEqual({
      loop: true,
      light: {
        url: expect.stringContaining(animation),
        colorFilters: [{ keypath: "color_glow", color: light }],
      },
      dark: {
        url: expect.stringContaining(animation),
        colorFilters: [{ keypath: "color_glow", color: dark }],
      },
    });
  });

  test("uses the server palette per theme and keeps every gradient stop", () => {
    const item = shopItemOf(
      view({
        style: {
          bg: [lightTheme.colors.bg.base],
          cell: [...lightTheme.gradients.primary.colors, ...darkTheme.gradients.hot.colors],
        },
        dark: { style: { bg: [darkTheme.colors.bg.base] } },
      }),
    );

    expect(item?.skin?.light).toEqual({
      frame: { gradient: [lightTheme.colors.bg.base] },
      cell: { stops: [...lightTheme.gradients.primary.colors, ...darkTheme.gradients.hot.colors] },
    });
    expect(item?.skin?.dark).toEqual({ frame: { gradient: [darkTheme.colors.bg.base] } });
  });

  test("reuses a one-theme texture without accepting external asset URLs", () => {
    const file = "a".repeat(64) + ".png";
    const item = shopItemOf(
      view({
        render: "textures",
        singleTheme: true,
        textures: { cell: "/shop/files/" + file, bg: "https://example.com/background.png" },
      }),
    );

    expect(item?.skin?.dark).toEqual(item?.skin?.light);
    expect(item?.skin?.dark?.textures).toEqual({
      cell: expect.stringContaining("/v1/shop/files/" + file),
    });
  });

  test("uses the built-in dark skin when the server has no dark palette", () => {
    const item = shopItemOf(view({ style: { bg: [lightTheme.colors.bg.base] } }));

    expect(item?.skin?.light).toBeDefined();
    expect(item?.skin?.dark).toBeUndefined();
  });

  test("uses the matching portrait textures and does not borrow the light frame in dark mode", () => {
    const light = "b".repeat(64) + ".png";
    const dark = "c".repeat(64) + ".png";
    const avatar = shopItemOf(
      view({
        kind: "avatar",
        render: "textures",
        textures: { avatar: "/shop/files/" + light },
        dark: { textures: { avatar: "/shop/files/" + dark } },
      }),
    );
    const frame = shopItemOf(
      view({
        kind: "frame",
        render: "textures",
        textures: { frame: "/shop/files/" + light },
      }),
    );

    expect(avatar?.profileTextures).toEqual({
      light: expect.stringContaining(light),
      dark: expect.stringContaining(dark),
    });
    expect(frame?.profileTextures?.dark).toBeUndefined();
  });

  test("leaves a bundle out of the items", () => {
    expect(shopItemOf(bundle)).toBeNull();
  });
});

describe("shopOf", () => {
  test("groups items by tab in the shop order and reads boards as fields", () => {
    const shop = shopOf(
      catalogOf([
        view({ key: "reef", tab: "boards" }),
        view({ key: "frame", tab: "profile", kind: "frame" }),
        view({ key: "night" }),
      ]),
    );

    expect(shop.tabs.map(({ id, items }) => [id, items.map((item) => item.id)])).toEqual([
      ["exclusive", ["night"]],
      ["fields", ["reef"]],
      ["profile", ["frame"]],
    ]);
  });

  test("hides the default items (decision 0055 #7)", () => {
    const shop = shopOf(catalogOf([view({ key: "base", tab: "boards", default: true })]));

    expect(shop.tabs).toEqual([]);
  });

  test("turns bundle items into bundles with the struck price and owned parts", () => {
    expect(shopOf(catalogOf([bundle])).bundles).toEqual([
      {
        id: "set",
        name: "Night signal",
        description: "Neon",
        rarity: "legendary",
        preview: "",
        items: ["creek", "fence_neon"],
        basePrice: { emeralds: 2340 },
        price: { emeralds: 456 },
        ownedItems: ["creek"],
        availableTo: "2026-11-08T12:00:00Z",
      },
    ]);
  });

  test("builds the drop banner from the featured item (decision 0055 #6)", () => {
    expect(shopOf(catalogOf([bundle], bundle)).featured).toEqual({
      id: "set",
      image: "",
      title: "Night signal",
      subtitle: "Neon",
      endsAt: "2026-11-08T12:00:00Z",
      target: { bundle: "set" },
    });
  });

  test("points the banner at an item when the featured offer is one", () => {
    const featured = view({ endsAt: "2026-11-08T12:00:00Z" });

    expect(shopOf(catalogOf([featured], featured)).featured?.target).toEqual({ item: "night" });
  });

  test("shows no banner without the end of the drop", () => {
    expect(shopOf(catalogOf([view()], view())).featured).toBeNull();
  });
});
