import type { Price, ShopCurrency } from "./item-type";
import { amountOf, currencyOf } from "./price-parts";

export const priceOf = (amount: number, currency: ShopCurrency): Price =>
  currency === "gems" ? { emeralds: amount } : { coins: amount };

export const backendPriceOf = (price: Price) => ({
  price: amountOf(price),
  currency: currencyOf(price) === "emeralds" ? ("gems" as const) : ("coins" as const),
});

export const changedPriceOf = ({ price, currency }: Record<string, unknown>): Price | null => {
  if (typeof price !== "number" || (currency !== "gems" && currency !== "coins")) return null;
  return priceOf(price, currency);
};
