import createClient from "openapi-fetch";

import { API_BASE_URL } from "@shared/config";

import { ApiError } from "./api-error";
import { createApiFetch } from "./api-fetch";
import type { Transport } from "./api-fetch";
import { apiMiddleware } from "./api-middleware";
import { BACKEND_ROUTES } from "./backend-routes";
import { createBackendTransport } from "./backend-transport";
import type { paths } from "./generated/schema";
import { API_PATH, createHybridTransport } from "./hybrid-transport";
import type * as MockServerModule from "./mocks/mock-server";

const realFetch: Transport = (request) => fetch(request);

const resolveBackend = (): { origin: string; transport: Transport } => {
  // A require nested in __DEV__ lets release builds drop the mocks with this branch; the cast only names the module's type (require внутри __DEV__ позволяет релизной сборке выбросить моки вместе с веткой; приведение лишь называет тип модуля).
  if (__DEV__) {
    const { MOCK_API_ORIGIN, mockServer } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./mocks/mock-server") as typeof MockServerModule;
    if (API_BASE_URL === "") return { origin: MOCK_API_ORIGIN, transport: mockServer.fetch };
    return {
      origin: API_BASE_URL,
      transport: createHybridTransport(BACKEND_ROUTES, realFetch, mockServer.fetch),
    };
  }
  return { origin: API_BASE_URL, transport: realFetch };
};

const backend = resolveBackend();

export const apiClient = createClient<paths>({
  baseUrl: `${backend.origin}${API_PATH}`,
  fetch: createApiFetch(createBackendTransport(backend.transport)),
});

apiClient.use(apiMiddleware);

// Assets come from the CDN, outside the API, but through the same transport, so dev builds get them from the mocks (ассеты идут с CDN, мимо API, но тем же транспортом, поэтому dev-сборки получают их из моков).
export const fetchAssetJson = async (url: string): Promise<unknown> => {
  const response = await backend.transport(new Request(url));
  if (!response.ok) throw new ApiError(response.status, null);
  return response.json();
};
