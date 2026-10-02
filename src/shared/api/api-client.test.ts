import { http, HttpResponse } from "msw/http";

import { APP_VERSION } from "@shared/config";
import { bootstrapMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { apiClient } from "./api-client";
import { REQUEST_TIMEOUT_MS, RequestTimeoutError } from "./api-fetch";
import { setApiSession } from "./api-session";
import { onSystemSignal } from "./system-signals";

const HTTP_UNAUTHORIZED = 401;
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const captureRequests = (method: "get" | "post", path: string) => {
  const requests: Request[] = [];
  mockServer.use(
    http[method](mockUrl(path), ({ request }) => {
      requests.push(request);
      return HttpResponse.json(bootstrapMock());
    }),
  );
  return requests;
};

const logout = () => apiClient.POST("/auth/logout", { body: { refreshToken: "r" } });

afterEach(() => {
  mockServer.reset();
  setApiSession(null);
  jest.useRealTimers();
});

describe("apiClient", () => {
  test("sends the app, platform, locale and request id headers", async () => {
    const requests = captureRequests("get", "/bootstrap");

    await apiClient.GET("/bootstrap");

    const headers = requests[0]?.headers;
    expect(headers?.get("X-App-Version")).toBe(APP_VERSION);
    expect(headers?.get("X-Platform")).toBe("ios");
    expect(headers?.get("X-Locale")).toMatch(/^(ru|en)$/);
    expect(headers?.get("X-Request-Id")).toMatch(UUID_V7);
  });

  test("adds an idempotency key to writing requests only", async () => {
    const reads = captureRequests("get", "/bootstrap");
    const writes = captureRequests("post", "/auth/logout");

    await apiClient.GET("/bootstrap");
    await logout();

    expect(reads[0]?.headers.has("Idempotency-Key")).toBe(false);
    expect(writes[0]?.headers.get("Idempotency-Key")).toMatch(UUID_V7);
  });

  test("keeps the idempotency key passed by the action", async () => {
    const writes = captureRequests("post", "/auth/logout");

    await apiClient.POST("/auth/logout", {
      body: { refreshToken: "r" },
      headers: { "Idempotency-Key": "action-key" },
    });

    expect(writes[0]?.headers.get("Idempotency-Key")).toBe("action-key");
  });

  test("sends the access token of the session", async () => {
    const requests = captureRequests("get", "/bootstrap");
    setApiSession({ getAccessToken: () => "token-1", refreshAccessToken: async () => null });

    await apiClient.GET("/bootstrap");

    expect(requests[0]?.headers.get("Authorization")).toBe("Bearer token-1");
  });

  test("refreshes the token once for concurrent 401s and repeats the requests", async () => {
    const refresh = jest.fn(async () => "token-2");
    setApiSession({ getAccessToken: () => "token-1", refreshAccessToken: refresh });
    mockServer.use(
      http.get(mockUrl("/bootstrap"), ({ request }) =>
        request.headers.get("Authorization") === "Bearer token-2"
          ? HttpResponse.json(bootstrapMock())
          : HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: HTTP_UNAUTHORIZED }),
      ),
    );

    const results = await Promise.all([apiClient.GET("/bootstrap"), apiClient.GET("/bootstrap")]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(results.map(({ response }) => response.status)).toEqual([200, 200]);
  });

  test("repeats a writing request with its body after a refresh", async () => {
    const bodies: unknown[] = [];
    setApiSession({ getAccessToken: () => "token-1", refreshAccessToken: async () => "token-2" });
    mockServer.use(
      http.post(mockUrl("/auth/logout"), async ({ request }) => {
        bodies.push(await request.json());
        return request.headers.get("Authorization") === "Bearer token-2"
          ? new HttpResponse(null, { status: 204 })
          : HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: HTTP_UNAUTHORIZED });
      }),
    );

    const { response } = await logout();

    expect(response.status).toBe(204);
    expect(bodies).toEqual([{ refreshToken: "r" }, { refreshToken: "r" }]);
  });

  test("returns the 401 when there is no session to refresh", async () => {
    mockServer.use(
      http.get(mockUrl("/bootstrap"), () =>
        HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: HTTP_UNAUTHORIZED }),
      ),
    );

    const { response } = await apiClient.GET("/bootstrap");

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
  });

  test("does not refresh on a 401 from the refresh itself", async () => {
    const refresh = jest.fn(async () => "token-2");
    setApiSession({ getAccessToken: () => null, refreshAccessToken: refresh });
    mockServer.use(
      http.post(mockUrl("/auth/refresh"), () =>
        HttpResponse.json({ error: { code: "SESSION_REVOKED" } }, { status: HTTP_UNAUTHORIZED }),
      ),
    );

    const { response } = await apiClient.POST("/auth/refresh", { body: { refreshToken: "r" } });

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect(refresh).not.toHaveBeenCalled();
  });

  test("signals an update on 426", async () => {
    const listener = jest.fn();
    const unsubscribe = onSystemSignal(listener);
    mockServer.use(
      http.get(mockUrl("/bootstrap"), () =>
        HttpResponse.json({ error: { code: "UPGRADE_REQUIRED" } }, { status: 426 }),
      ),
    );

    await apiClient.GET("/bootstrap");
    unsubscribe();

    expect(listener).toHaveBeenCalledWith("upgradeRequired");
  });

  test("signals maintenance only on a 503 with the maintenance code", async () => {
    const listener = jest.fn();
    const unsubscribe = onSystemSignal(listener);
    mockServer.use(
      http.get(mockUrl("/bootstrap"), () =>
        HttpResponse.json({ error: { code: "MAINTENANCE" } }, { status: 503 }),
      ),
      http.get(mockUrl("/me"), () => new HttpResponse("busy", { status: 503 })),
    );

    await apiClient.GET("/me");
    await apiClient.GET("/bootstrap");
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("maintenance");
  });

  test("fails a request that takes longer than the timeout", async () => {
    jest.useFakeTimers();
    mockServer.use(http.get(mockUrl("/bootstrap"), () => new Promise<never>(() => undefined)));

    const result = expect(apiClient.GET("/bootstrap")).rejects.toBeInstanceOf(RequestTimeoutError);
    await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    await result;
  });
});
