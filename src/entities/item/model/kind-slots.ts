import type { ShopKind, Slot } from "./item-type";

type ItemKind = Exclude<ShopKind, "bundle">;

const SLOT_OF_KIND = {
  board: "field",
  fence: "fence",
  stream: "stream",
  bridge: "bridge",
  heavy: "x2",
  rock: "rock",
  bomb: "bomb",
  buoy: "buoy",
  beacon: "beacon",
  marker: "target",
  number: "number",
  tap: "fxClick",
  reveal: "fxReveal",
  win: "fxVictory",
  frame: "frame",
  title: "title",
  avatar: "avatar",
} as const satisfies Record<ItemKind, Slot>;

const EFFECT_SLOTS: ReadonlySet<Slot> = new Set(["fxClick", "fxReveal", "fxVictory"]);

const isItemKind = (kind: string): kind is ItemKind => Object.hasOwn(SLOT_OF_KIND, kind);

export const slotOfKind = (kind: string): Slot | null =>
  isItemKind(kind) ? SLOT_OF_KIND[kind] : null;

export const kindOfSlot = (slot: Slot): ItemKind => {
  const kinds = Object.keys(SLOT_OF_KIND).filter(isItemKind);
  // Every slot is a value of SLOT_OF_KIND, so one kind always matches (каждый слот — значение SLOT_OF_KIND, поэтому тип всегда находится).
  return kinds.find((kind) => SLOT_OF_KIND[kind] === slot) as ItemKind;
};

// Effects are seen only by their owner (SHP-12) (эффекты видит только их владелец).
export const isVisibleInMatch = (slot: Slot) => !EFFECT_SLOTS.has(slot);
