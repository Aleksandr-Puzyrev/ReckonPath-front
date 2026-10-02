import "./msw-runtime-polyfill";

import { HttpResponse } from "msw/http";
import type { HttpHandler } from "msw/http";
import { getResponse } from "msw/utils/get-response";

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
  },
  fetch: respond,
};
