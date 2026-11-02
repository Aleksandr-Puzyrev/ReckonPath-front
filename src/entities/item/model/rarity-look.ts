import type { Rarity } from "./item-type";

export type RarityLook = Exclude<Rarity, "exclusive">;

// Exclusive items wear the legendary look until their own is decided (decision 0054 #2) (эксклюзивные предметы выглядят как легендарные, пока их вид не решён).
export const rarityLookOf = (rarity: Rarity): RarityLook =>
  rarity === "exclusive" ? "legendary" : rarity;
