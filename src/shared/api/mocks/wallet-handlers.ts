import { http, HttpResponse } from "msw/http";

import { restoreMockStreak, streakRestorePrice } from "./daily-handlers";
import { mockShopState } from "./mock-shop";
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

const ME = {
  id: "0192a000-0000-7000-8000-000000004821",
  nickname: "Player4821",
  isGuest: true,
  providers: [],
  level: 1,
  xp: 0,
  xpToNext: 100,
  arena: { trophies: 0, league: "BRONZE", division: 3, peak: 0, rp: 0, seasonId: 1 },
  flags: { nickChangeFreeAvailable: true, nickChangeAvailableAt: null, deletionScheduledAt: null },
  friendCode: "PL4821",
};

export const walletHandlers = [
  http.get(mockUrl("/me"), () =>
    HttpResponse.json({ ...ME, wallet: mockWallet(), loadout: mockShopState().loadout }),
  ),
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
