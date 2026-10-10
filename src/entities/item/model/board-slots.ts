import type { Slot } from "./item-type";

export const BOARD_SLOTS = [
  "field",
  "fence",
  "stream",
  "rock",
  "x2",
  "bridge",
  "bomb",
  "target",
] as const satisfies readonly Slot[];

export const isBoardSlot = (slot: string) => BOARD_SLOTS.some((boardSlot) => boardSlot === slot);
