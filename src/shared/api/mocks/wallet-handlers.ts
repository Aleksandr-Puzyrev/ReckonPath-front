import { http, HttpResponse } from "msw/http";

import { restoreMockStreak, streakRestorePrice } from "./daily-handlers";
import { chargeEmeralds, mockWallet } from "./mock-wallet";
import { mockUrl } from "./mock-url";

const CONTINUE_PRICE = 15;
const BONUS_MOVES = 3;
const HTTP_UNPROCESSABLE = 422;

const insufficientFunds = (price: number) =>
  HttpResponse.json(
    {
      error: {
        code: "INSUFFICIENT_FUNDS",
        details: { need: price - mockWallet().emeralds },
      },
    },
    { status: HTTP_UNPROCESSABLE },
  );

export const walletHandlers = [
  http.post(mockUrl("/continue"), () => {
    if (!chargeEmeralds(CONTINUE_PRICE)) return insufficientFunds(CONTINUE_PRICE);
    return HttpResponse.json({ granted: true, bonusMoves: BONUS_MOVES, wallet: mockWallet() });
  }),
  http.post(mockUrl("/streak/restore"), () => {
    const price = streakRestorePrice();
    if (!chargeEmeralds(price)) return insufficientFunds(price);
    return HttpResponse.json({ streak: restoreMockStreak(), wallet: mockWallet() });
  }),
];
