import { backendPriceOf, changedPriceOf, priceOf } from "./backend-price";

describe("backend price", () => {
  test("reads gems as emeralds", () => {
    expect(priceOf(1680, "gems")).toEqual({ emeralds: 1680 });
    expect(priceOf(4200, "coins")).toEqual({ coins: 4200 });
  });

  test("sends emeralds as gems", () => {
    expect(backendPriceOf({ emeralds: 480 })).toEqual({ price: 480, currency: "gems" });
    expect(backendPriceOf({ coins: 2000 })).toEqual({ price: 2000, currency: "coins" });
  });

  test("reads the new price of price_changed", () => {
    expect(changedPriceOf({ price: 520, currency: "gems" })).toEqual({ emeralds: 520 });
  });

  test("ignores price_changed details without a price", () => {
    expect(changedPriceOf({})).toBeNull();
  });
});
