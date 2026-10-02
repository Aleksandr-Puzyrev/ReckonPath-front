import { accessToken, refreshAccessToken } from "./api-session";

export type Transport = (request: Request) => Promise<Response>;

export const REQUEST_TIMEOUT_MS = 10_000;
const HTTP_UNAUTHORIZED = 401;
const SESSION_PATHS = ["/v1/auth/guest", "/v1/auth/refresh"];

export class RequestTimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "RequestTimeoutError";
  }
}

// A 401 from sign-in or refresh itself is final, or the refresh would wait for itself (401 от входа или самого refresh окончательный, иначе refresh ждал бы сам себя).
const isSessionRequest = (request: Request) => {
  const { pathname } = new URL(request.url);
  return SESSION_PATHS.some((path) => pathname.endsWith(path));
};

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
    // Sending consumes the body, so the replay copy is taken first (отправка расходует тело запроса, поэтому копия для повтора берётся заранее).
    const replay = request.clone();
    const response = await sendWithTimeout(transport, withToken(request, accessToken()));
    if (response.status !== HTTP_UNAUTHORIZED || isSessionRequest(request)) return response;
    const token = await refreshAccessToken();
    if (token === null) return response;
    return sendWithTimeout(transport, withToken(replay, token));
  };
