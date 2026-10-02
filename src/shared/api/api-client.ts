import createClient from "openapi-fetch";

import { API_BASE_URL } from "@shared/config";

import { createApiFetch } from "./api-fetch";
import type { Transport } from "./api-fetch";
import { apiMiddleware } from "./api-middleware";
import type { paths } from "./generated/schema";
import type * as MockServerModule from "./mocks/mock-server";

const API_PATH = "/v1";

const resolveBackend = (): { origin: string; transport: Transport } => {
  // A require nested in __DEV__ lets release builds drop the mocks with this branch; the cast only names the module's type (require внутри __DEV__ позволяет релизной сборке выбросить моки вместе с веткой; приведение лишь называет тип модуля).
  if (__DEV__) {
    if (API_BASE_URL === "") {
      const { MOCK_API_ORIGIN, mockServer } =
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("./mocks/mock-server") as typeof MockServerModule;
      return { origin: MOCK_API_ORIGIN, transport: mockServer.fetch };
    }
  }
  return { origin: API_BASE_URL, transport: (request) => fetch(request) };
};

const backend = resolveBackend();

export const apiClient = createClient<paths>({
  baseUrl: `${backend.origin}${API_PATH}`,
  fetch: createApiFetch(backend.transport),
});

apiClient.use(apiMiddleware);
