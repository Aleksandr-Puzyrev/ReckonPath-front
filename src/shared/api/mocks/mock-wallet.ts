import { clearMockState, loadMockState, saveMockState } from "./mock-state";

interface Wallet {
  emeralds: number;
  coins: number;
}

const STATE_NAME = "wallet";
// The balances of design 3.1, so continues and restores can be tried at once (балансы из дизайна 3.1, чтобы продолжение и восстановление можно было сразу попробовать).
const START_WALLET: Wallet = { emeralds: 2640, coins: 18420 };

let wallet = loadMockState<Wallet>(STATE_NAME, START_WALLET);

export const mockWallet = () => wallet;

export const chargeEmeralds = (amount: number) => {
  if (wallet.emeralds < amount) return false;
  wallet = { ...wallet, emeralds: wallet.emeralds - amount };
  saveMockState(STATE_NAME, wallet);
  return true;
};

export const creditEmeralds = (amount: number) => {
  wallet = { ...wallet, emeralds: wallet.emeralds + amount };
  saveMockState(STATE_NAME, wallet);
};

export const creditCoins = (amount: number) => {
  wallet = { ...wallet, coins: wallet.coins + amount };
  saveMockState(STATE_NAME, wallet);
};

export type MockPrice = { emeralds: number } | { coins: number };

export const shortOf = (price: MockPrice) =>
  "emeralds" in price ? price.emeralds - wallet.emeralds : price.coins - wallet.coins;

export const chargePrice = (price: MockPrice) => {
  if (shortOf(price) > 0) return false;
  wallet =
    "emeralds" in price
      ? { ...wallet, emeralds: wallet.emeralds - price.emeralds }
      : { ...wallet, coins: wallet.coins - price.coins };
  saveMockState(STATE_NAME, wallet);
  return true;
};

export const resetMockWallet = () => {
  wallet = START_WALLET;
  clearMockState(STATE_NAME);
};
