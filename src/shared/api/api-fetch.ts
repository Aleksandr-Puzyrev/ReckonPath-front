import { accessToken, hasAccount, refreshAccessToken } from "./api-session";

export type Transport = (request: Request) => Promise<Response>;

export const REQUEST_TIMEOUT_MS = 10_000;
const HTTP_UNAUTHORIZED = 401;
const PUBLIC_PATHS = [
  "/v1/bootstrap",
  "/v1/version",
  "/v1/maintenance",
  "/v1/auth/",
  "/v1/support/tickets",
];
const SESSION_PATHS = [
  "/v1/auth/refresh",
  "/v1/auth/login",
  "/v1/auth/register",
  "/v1/auth/oauth/",
];

export class RequestTimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "RequestTimeoutError";
  }
}

const pathOf = (request: Request) => new URL(request.url).pathname;

// A 401 from sign-in or refresh is final: there it means wrong credentials, and a refresh would wait for itself (401 от входа или refresh окончательный: там он значит неверные данные, а refresh ждал бы сам себя).
const isSessionRequest = (request: Request) =>
  SESSION_PATHS.some((path) => pathOf(request).includes(path));

// A guest has no account on the server, so its private requests never leave the device (у гостя нет аккаунта на сервере, поэтому его закрытые запросы не уходят с устройства).
const isHeldForGuest = (request: Request) =>
  !hasAccount() && !PUBLIC_PATHS.some((path) => pathOf(request).includes(path));

const guestResponse = () =>
  new Response(JSON.stringify({ error: { code: "unauthenticated" } }), {
    status: HTTP_UNAUTHORIZED,
    headers: { "Content-Type": "application/json" },
  });

const withToken = (request: Request, token: string | null) => {
  if (token !== null) request.headers.set("Authorization", `Bearer ${token}`);
  return request;
};

const sendWithTimeout = async (transport: Transport, request: Request) => {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // The race also stops transports that ignore the abort signal (гонка останавливает и транспорт, который не слушает сигнал отмены).
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new RequestTimeoutError());
    }, REQUEST_TIMEOUT_MS);
  });
  try {
    return await Promise.race([
      transport(new Request(request, { signal: controller.signal })),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
};

export const createApiFetch =
  (transport: Transport): Transport =>
  async (request) => {
    if (isHeldForGuest(request)) return guestResponse();
    // Sending consumes the body, so the replay copy is taken first (отправка расходует тело запроса, поэтому копия для повтора берётся заранее).
    const replay = request.clone();
    const response = await sendWithTimeout(transport, withToken(request, accessToken()));
    if (response.status !== HTTP_UNAUTHORIZED || isSessionRequest(request)) return response;
    const token = await refreshAccessToken();
    if (token === null) return response;
    return sendWithTimeout(transport, withToken(replay, token));
  };
