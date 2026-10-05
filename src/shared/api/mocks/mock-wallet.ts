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

export const resetMockWallet = () => {
  wallet = START_WALLET;
  clearMockState(STATE_NAME);
};
