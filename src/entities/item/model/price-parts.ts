import type { Price } from "./item-type";

export type Currency = "emeralds" | "coins";

export const currencyOf = (price: Price): Currency => ("emeralds" in price ? "emeralds" : "coins");

export const amountOf = (price: Price) => ("emeralds" in price ? price.emeralds : price.coins);
