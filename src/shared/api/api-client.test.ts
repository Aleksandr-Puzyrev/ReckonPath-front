import { http, HttpResponse } from "msw/http";

import { APP_VERSION } from "@shared/config";
import { ACCOUNT_SESSION } from "@shared/test-utils/account-session";
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

const logout = () => apiClient.POST("/auth/logout");

afterEach(() => {
  mockServer.reset();
  setApiSession(null);
  jest.useRealTimers();
});

describe("apiClient", () => {
  test("sends the app, platform, locale, language and request id headers", async () => {
    const requests = captureRequests("get", "/bootstrap");

    await apiClient.GET("/bootstrap");

    const headers = requests[0]?.headers;
    expect(headers?.get("X-App-Version")).toBe(APP_VERSION);
    expect(headers?.get("X-Platform")).toBe("ios");
    expect(headers?.get("X-Locale")).toMatch(/^(ru|en)$/);
    expect(headers?.get("Accept-Language")).toBe(headers?.get("X-Locale"));
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

    await apiClient.POST("/auth/logout", { headers: { "Idempotency-Key": "action-key" } });

    expect(writes[0]?.headers.get("Idempotency-Key")).toBe("action-key");
  });

  test("sends the access token of the session", async () => {
    const requests = captureRequests("get", "/bootstrap");
    setApiSession({
      ...ACCOUNT_SESSION,
      getAccessToken: () => "token-1",
      refreshAccessToken: async () => null,
    });

    await apiClient.GET("/bootstrap");

    expect(requests[0]?.headers.get("Authorization")).toBe("Bearer token-1");
  });

  test("refreshes the token once for concurrent 401s and repeats the requests", async () => {
    const refresh = jest.fn(async () => "token-2");
    setApiSession({
      ...ACCOUNT_SESSION,
      getAccessToken: () => "token-1",
      refreshAccessToken: refresh,
    });
    mockServer.use(
      http.get(mockUrl("/bootstrap"), ({ request }) =>
        request.headers.get("Authorization") === "Bearer token-2"
          ? HttpResponse.json(bootstrapMock())
          : HttpResponse.json(
              { error: { code: "unauthenticated" } },
              { status: HTTP_UNAUTHORIZED },
            ),
      ),
    );

    const results = await Promise.all([apiClient.GET("/bootstrap"), apiClient.GET("/bootstrap")]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(results.map(({ response }) => response.status)).toEqual([200, 200]);
  });

  test("repeats a writing request with its body after a refresh", async () => {
    const bodies: unknown[] = [];
    setApiSession({
      ...ACCOUNT_SESSION,
      getAccessToken: () => "token-1",
      refreshAccessToken: async () => "token-2",
    });
    mockServer.use(
      http.patch(mockUrl("/me"), async ({ request }) => {
        bodies.push(await request.json());
        return request.headers.get("Authorization") === "Bearer token-2"
          ? new HttpResponse(null, { status: 204 })
          : HttpResponse.json(
              { error: { code: "unauthenticated" } },
              { status: HTTP_UNAUTHORIZED },
            );
      }),
    );

    const { response } = await apiClient.PATCH("/me", { body: { locale: "en" } });

    expect(response.status).toBe(204);
    expect(bodies).toEqual([{ locale: "en" }, { locale: "en" }]);
  });

  test("returns the 401 when there is no session to refresh", async () => {
    mockServer.use(
      http.get(mockUrl("/bootstrap"), () =>
        HttpResponse.json({ error: { code: "unauthenticated" } }, { status: HTTP_UNAUTHORIZED }),
      ),
    );

    const { response } = await apiClient.GET("/bootstrap");

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
  });

  test("does not refresh on a 401 from the refresh itself", async () => {
    const refresh = jest.fn(async () => "token-2");
    setApiSession({ ...ACCOUNT_SESSION, getAccessToken: () => null, refreshAccessToken: refresh });
    mockServer.use(
      http.post(mockUrl("/auth/refresh"), () =>
        HttpResponse.json({ error: { code: "session_revoked" } }, { status: HTTP_UNAUTHORIZED }),
      ),
    );

    const { response } = await apiClient.POST("/auth/refresh", { body: { refreshToken: "r" } });

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect(refresh).not.toHaveBeenCalled();
  });

  test("does not refresh on a 401 from sign-in, where it means wrong credentials", async () => {
    const refresh = jest.fn(async () => "token-2");
    setApiSession({
      ...ACCOUNT_SESSION,
      getAccessToken: () => "token-1",
      refreshAccessToken: refresh,
    });
    mockServer.use(
      http.post(mockUrl("/auth/login"), () =>
        HttpResponse.json(
          { error: { code: "invalid_credentials" } },
          { status: HTTP_UNAUTHORIZED },
        ),
      ),
    );

    const { response } = await apiClient.POST("/auth/login", {
      body: {
        email: "nova@mail.ru",
        password: "secret-pass",
        device: { deviceId: "device-1", platform: "ios" },
      },
    });

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect(refresh).not.toHaveBeenCalled();
  });

  test("keeps a guest's private requests on the device (decision 0051)", async () => {
    setApiSession({ ...ACCOUNT_SESSION, hasAccount: () => false });
    const requests = captureRequests("get", "/me");

    const { response } = await apiClient.GET("/me");

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect(requests).toHaveLength(0);
  });

  test("lets a guest's public requests through", async () => {
    setApiSession({ ...ACCOUNT_SESSION, hasAccount: () => false });
    const requests = captureRequests("get", "/bootstrap");

    await apiClient.GET("/bootstrap");

    expect(requests).toHaveLength(1);
  });

  test("signals an update on 426", async () => {
    const listener = jest.fn();
    const unsubscribe = onSystemSignal(listener);
    mockServer.use(
      http.get(mockUrl("/bootstrap"), () =>
        HttpResponse.json({ error: { code: "app_update_required" } }, { status: 426 }),
      ),
    );

    await apiClient.GET("/bootstrap");
    unsubscribe();

    expect(listener).toHaveBeenCalledWith("upgradeRequired", undefined);
  });

  test("signals maintenance only on a 503 with the maintenance code", async () => {
    const listener = jest.fn();
    const unsubscribe = onSystemSignal(listener);
    mockServer.use(
      http.get(mockUrl("/bootstrap"), () =>
        HttpResponse.json({ error: { code: "maintenance" } }, { status: 503 }),
      ),
      http.get(mockUrl("/me"), () => new HttpResponse("busy", { status: 503 })),
    );

    await apiClient.GET("/me");
    await apiClient.GET("/bootstrap");
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("maintenance", undefined);
  });

  test("signals a ban with its details on a 403 with the ban code (decision 0038 #7)", async () => {
    const listener = jest.fn();
    const unsubscribe = onSystemSignal(listener);
    const details = { scope: "all", until: null, reason: "Cheating" };
    mockServer.use(
      http.get(mockUrl("/me"), () =>
        HttpResponse.json({ error: { code: "banned", details } }, { status: 403 }),
      ),
    );

    await apiClient.GET("/me");
    unsubscribe();

    expect(listener).toHaveBeenCalledWith("banned", details);
  });

  test("fails a request that takes longer than the timeout", async () => {
    jest.useFakeTimers();
    mockServer.use(http.get(mockUrl("/bootstrap"), () => new Promise<never>(() => undefined)));

    const result = expect(apiClient.GET("/bootstrap")).rejects.toBeInstanceOf(RequestTimeoutError);
    await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    await result;
  });
});
