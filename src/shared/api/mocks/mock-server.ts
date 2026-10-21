import "./msw-runtime-polyfill";

import { HttpResponse } from "msw/http";
import type { HttpHandler } from "msw/http";
import { getResponse } from "msw/utils/get-response";

import { resetMockAds } from "./ads-handlers";
import { resetMockArenaMaps } from "./arena-map-handlers";
import { resetMockAsync } from "./async-handlers";
import { resetMockAttempts } from "./attempts-handlers";
import { resetMockAuth } from "./auth-handlers";
import { resetMockDaily } from "./daily-handlers";
import { fakeGameServer } from "./fake-game/fake-game-server";
import { resetMockArenaProfile } from "./mock-arena-profile";
import { resetMockPlayer } from "./mock-player";
import { resetMockMapCheck } from "./mock-map-check";
import { resetMockMe } from "./me-handlers";
import { resetMockShop } from "./mock-shop";
import { resetMockSupport } from "./support-handlers";
import { resetMockWallet } from "./mock-wallet";
import { resetMockPurchases } from "./shop-handlers";
import { handlers } from "./handlers";

export { MOCK_API_ORIGIN } from "./mock-url";

const HTTP_NOT_FOUND = 404;

let overrides: HttpHandler[] = [];

const respond = async (request: Request): Promise<Response> => {
  const response = await getResponse([...overrides, ...handlers], request);
  if (response === undefined) {
    return HttpResponse.json({ error: { code: "NOT_FOUND" } }, { status: HTTP_NOT_FOUND });
  }
  // HttpResponse.error() is a network failure, which fetch reports by rejecting (HttpResponse.error() — это сбой сети, о котором fetch сообщает отказом).
  if (response.type === "error") throw new TypeError("Network request failed");
  return response;
};

export const mockServer = {
  use: (...next: HttpHandler[]) => {
    overrides = [...next, ...overrides];
  },
  reset: () => {
    overrides = [];
    resetMockAuth();
    resetMockAttempts();
    resetMockDaily();
    resetMockWallet();
    resetMockShop();
    resetMockMe();
    resetMockSupport();
    resetMockPurchases();
    resetMockAds();
    resetMockArenaMaps();
    resetMockAsync();
    resetMockMapCheck();
    resetMockArenaProfile();
    resetMockPlayer();
    fakeGameServer.reset();
  },
  fetch: respond,
};
