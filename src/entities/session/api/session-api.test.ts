import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import { http, HttpResponse } from "msw/http";

import { apiClient, setApiSession } from "@shared/api";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useSessionStore } from "../model/session-store";

import { apiSession, ensureSession } from "./session-api";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const HTTP_UNAUTHORIZED = 401;

const watchGuestSignIns = () => {
  const deviceIds: string[] = [];
  mockServer.use(
    http.post(mockUrl("/auth/guest"), async ({ request }) => {
      const body: unknown = await request.clone().json();
      if (typeof body === "object" && body !== null && "deviceId" in body) {
        deviceIds.push(String(body.deviceId));
      }
      return undefined;
    }),
  );
  return deviceIds;
};

const watchRefreshes = () => {
  const counter = { count: 0 };
  mockServer.use(
    http.post(mockUrl("/auth/refresh"), () => {
      counter.count += 1;
      return undefined;
    }),
  );
  return counter;
};

// /me accepts only the newest access token, like a server whose old tokens expired (/me принимает только последний access, как сервер с истёкшими токенами).
const serveMeFor = (accessToken: string) =>
  mockServer.use(
    http.get(mockUrl("/me"), ({ request }) =>
      request.headers.get("Authorization") === `Bearer ${accessToken}`
        ? HttpResponse.json({})
        : HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: HTTP_UNAUTHORIZED }),
    ),
  );

beforeEach(() => setApiSession(apiSession));

afterEach(() => {
  mockServer.reset();
  secureStore.__reset();
  useSessionStore.getState().reset();
  setApiSession(null);
});

describe("ensureSession", () => {
  test("creates a guest silently on a clean install (ACC-01)", async () => {
    await ensureSession();

    expect(await getItemAsync("reckon-path.refresh-token")).toBe("r_1");
    expect(useSessionStore.getState().accessToken).toBe("a_1");
  });

  test("does not create another guest when a session is saved", async () => {
    await ensureSession();
    const deviceIds = watchGuestSignIns();

    await ensureSession();

    expect(deviceIds).toEqual([]);
  });

  test("keeps the device id between guests", async () => {
    const deviceIds = watchGuestSignIns();
    await ensureSession();
    await deleteItemAsync("reckon-path.refresh-token");
    await ensureSession();

    expect(deviceIds).toHaveLength(2);
    expect(deviceIds[1]).toBe(deviceIds[0]);
  });

  test("shares one sign-in between concurrent calls", async () => {
    const deviceIds = watchGuestSignIns();

    await Promise.all([ensureSession(), ensureSession()]);

    expect(deviceIds).toHaveLength(1);
  });
});

describe("session refresh", () => {
  test("refreshes once for three requests with an expired token (NET-09)", async () => {
    await ensureSession();
    const refreshes = watchRefreshes();
    serveMeFor("a_2");

    const results = await Promise.all([
      apiClient.GET("/me"),
      apiClient.GET("/me"),
      apiClient.GET("/me"),
    ]);

    expect(refreshes.count).toBe(1);
    expect(results.map(({ response }) => response.status)).toEqual([200, 200, 200]);
    expect(await getItemAsync("reckon-path.refresh-token")).toBe("r_2");
  });

  test("starts a new guest when the stolen refresh token revoked the session (ACC-15)", async () => {
    await ensureSession();
    await apiClient.POST("/auth/refresh", { body: { refreshToken: "r_1" } });
    const deviceIds = watchGuestSignIns();
    serveMeFor("a_3");

    const { response } = await apiClient.GET("/me");

    expect(response.status).toBe(200);
    expect(deviceIds).toEqual([await getItemAsync("reckon-path.device-id")]);
    expect(await getItemAsync("reckon-path.refresh-token")).toBe("r_3");
  });

  test("keeps the session on a 401 from the refresh that is not a revocation", async () => {
    await ensureSession();
    const deviceIds = watchGuestSignIns();
    mockServer.use(
      http.post(mockUrl("/auth/refresh"), () =>
        HttpResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: HTTP_UNAUTHORIZED }),
      ),
    );

    await expect(apiSession.refreshAccessToken()).rejects.toThrow();

    expect(deviceIds).toEqual([]);
    expect(await getItemAsync("reckon-path.refresh-token")).toBe("r_1");
  });

  test("lets a request rejected during the first sign-in wait for its token", async () => {
    serveMeFor("a_1");

    const [{ response }] = await Promise.all([apiClient.GET("/me"), ensureSession()]);

    expect(response.status).toBe(200);
  });
});
