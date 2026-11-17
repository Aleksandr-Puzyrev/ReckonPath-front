import "./msw-runtime-polyfill";

import { HttpResponse } from "msw/http";
import type { HttpHandler } from "msw/http";
import { getResponse } from "msw/utils/get-response";

import { resetMockAds } from "./ads-handlers";
import { resetMockArenaMaps } from "./arena-map-handlers";
import { resetMockAuth } from "./auth-handlers";
import { resetMockCampaign } from "./mock-campaign";
import { serveBackendStyle } from "./backend-style";
import { resetMockCustomLevels } from "./custom-level-handlers";
import { resetMockDaily } from "./mock-daily";
import { resetMockDevices } from "./device-handlers";
import { resetMockArena } from "./mock-arena";
import { resetMockMatch } from "./match-handlers";
import { resetMockPlayer } from "./mock-player";
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
    return HttpResponse.json({ error: { code: "not_found" } }, { status: HTTP_NOT_FOUND });
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
    resetMockCampaign();
    resetMockDaily();
    resetMockDevices();
    resetMockWallet();
    resetMockShop();
    resetMockMe();
    resetMockCustomLevels();
    resetMockSupport();
    resetMockPurchases();
    resetMockAds();
    resetMockArenaMaps();
    resetMockArena();
    resetMockMatch();
    resetMockPlayer();
  },
  fetch: serveBackendStyle(respond),
};
