import type { BackendRoute } from "./hybrid-transport";

// Grows task by task as the client adopts each backend endpoint; until then a path stays on the mocks (растёт от задачи к задаче, по мере подстройки клиента под эндпоинты бэкенда; до тех пор путь остаётся на моках).
export const BACKEND_ROUTES: readonly BackendRoute[] = [
  { method: "GET", path: "/version" },
  { method: "GET", path: "/maintenance" },
  { method: "POST", path: "/auth/register" },
  { method: "POST", path: "/auth/register/resend" },
  { method: "POST", path: "/auth/register/verify" },
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/auth/refresh" },
  { method: "POST", path: "/auth/logout" },
  { method: "DELETE", path: "/me" },
];
