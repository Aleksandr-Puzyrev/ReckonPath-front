import type { Transport } from "./api-fetch";
import type { paths } from "./generated/schema";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface BackendRoute {
  method: Method;
  path: keyof paths;
}

export const API_PATH = "/v1";
const PATH_PARAM = /\{[^/]+\}/g;

const patternOf = ({ path }: BackendRoute) => new RegExp(`^${path.replace(PATH_PARAM, "[^/]+")}$`);

const apiPathOf = (request: Request) => {
  const { pathname } = new URL(request.url);
  const start = pathname.indexOf(`${API_PATH}/`);
  return start === -1 ? null : pathname.slice(start + API_PATH.length);
};

export const matchesRoute = (request: Request, route: BackendRoute) => {
  const path = apiPathOf(request);
  return path !== null && request.method === route.method && patternOf(route).test(path);
};

export const createHybridTransport =
  (routes: readonly BackendRoute[], backend: Transport, mocks: Transport): Transport =>
  (request) =>
    routes.some((route) => matchesRoute(request, route)) ? backend(request) : mocks(request);
