import { http, HttpResponse } from "msw/http";

import { mockWallet } from "./mock-wallet";
import { mockUrl } from "./mock-url";

export const walletHandlers = [
  http.get(mockUrl("/wallet"), () =>
    HttpResponse.json({ coins: mockWallet().coins, gems: mockWallet().emeralds }),
  ),
];
