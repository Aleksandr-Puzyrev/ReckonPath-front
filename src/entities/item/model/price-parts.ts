import type { Price } from "./item-type";

export type Currency = "emeralds" | "coins";

export const currencyOf = (price: Price): Currency => ("emeralds" in price ? "emeralds" : "coins");

export const amountOf = (price: Price) => ("emeralds" in price ? price.emeralds : price.coins);

export const isPrice = (value: unknown): value is Price => {
  if (typeof value !== "object" || value === null) return false;
  return (
    ("emeralds" in value && typeof value.emeralds === "number") ||
    ("coins" in value && typeof value.coins === "number")
  );
};
