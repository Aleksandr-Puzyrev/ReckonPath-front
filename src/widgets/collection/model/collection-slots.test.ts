import type { InventoryEntry } from "@entities/item";

import { equippedEntryOf, slotOptionsOf } from "./collection-slots";

const entry = (itemId: string, slot: InventoryEntry["slot"]): InventoryEntry => ({
  itemId,
  slot,
  acquiredAt: "2026-10-10T12:00:00Z",
  source: "shop",
  item: {
    type: "FIELD",
    rarity: "rare",
    name: itemId,
    description: "",
    preview: "",
    package: { url: "", sha256: "", version: 1 },
  },
});

const INVENTORY = [entry("reef", "field"), entry("garden", "field"), entry("neon", "frame")];

describe("slotOptionsOf", () => {
  test("lists the owned items of a slot and marks the equipped one", () => {
    expect(slotOptionsOf("field", { field: "garden" }, INVENTORY)).toEqual([
      { entry: INVENTORY[0], isEquipped: false },
      { entry: INVENTORY[1], isEquipped: true },
    ]);
  });

  test("is empty for a slot with nothing owned", () => {
    expect(slotOptionsOf("bridge", {}, INVENTORY)).toEqual([]);
  });
});

describe("equippedEntryOf", () => {
  test("finds the equipped item of a slot", () => {
    expect(equippedEntryOf("frame", { frame: "neon" }, INVENTORY)?.itemId).toBe("neon");
  });

  test("is null for the default item", () => {
    expect(equippedEntryOf("field", { field: null }, INVENTORY)).toBeNull();
  });
});
