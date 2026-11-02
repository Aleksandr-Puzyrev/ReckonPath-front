import { inventoryOf } from "./inventory-of";
import type { ShopItemView } from "./item-type";

const view = (fields: Partial<ShopItemView> = {}): ShopItemView => ({
  key: "reef",
  tab: "boards",
  kind: "board",
  title: "Coral reef",
  description: "",
  rarity: "rare",
  currency: "gems",
  price: 480,
  owned: true,
  equipped: false,
  ...fields,
});

describe("inventoryOf", () => {
  test("lists owned items by slot", () => {
    const { items } = inventoryOf({ items: [view()], equipped: {} });

    expect(items).toEqual([
      {
        itemId: "reef",
        slot: "field",
        item: expect.objectContaining({ name: "Coral reef", rarity: "rare" }),
      },
    ]);
  });

  test("hides the default items (decision 0055 #7)", () => {
    const { items } = inventoryOf({ items: [view({ default: true })], equipped: {} });

    expect(items).toEqual([]);
  });

  test("reads the equipped items by slot and skips the empty ones", () => {
    const { loadout } = inventoryOf({
      items: [view()],
      equipped: { board: "reef", marker: "gold", fence: "" },
    });

    expect(loadout).toEqual({ field: "reef", target: "gold" });
  });
});
