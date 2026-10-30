import { getItemAsync, setItemAsync } from "expo-secure-store";
import { http, HttpResponse } from "msw/http";

import { apiClient, setApiSession } from "@shared/api";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useAccountStore } from "../model/account-store";
import { useSessionStore } from "../model/session-store";

import { apiSession, deviceInfo, endSession, hasSavedSession, startSession } from "./session-api";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const HTTP_UNAUTHORIZED = 401;
const REFRESH_KEY = "reckon-path.refresh-token";
const TOKENS = { accessToken: "a_0", refreshToken: "r_0", expiresIn: 900 };

const watchRequests = (path: string) => {
  const counter = { count: 0 };
  mockServer.use(
    http.post(mockUrl(path), () => {
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
        : HttpResponse.json({ error: { code: "unauthenticated" } }, { status: HTTP_UNAUTHORIZED }),
    ),
  );

const signIn = async () => {
  const { data } = await apiClient.POST("/auth/login", {
    body: { email: "nova@mail.ru", password: "secret-pass", device: await deviceInfo() },
  });
  await startSession(data ?? TOKENS);
  useAccountStore.getState().markSignedIn();
};

beforeEach(() => setApiSession(apiSession));

afterEach(() => {
  mockServer.reset();
  secureStore.__reset();
  useSessionStore.getState().reset();
  useAccountStore.getState().reset();
  setApiSession(null);
});

describe("the local guest (decision 0048 #2)", () => {
  test("has no session and asks the server for none", async () => {
    const refreshes = watchRequests("/auth/refresh");

    expect(await hasSavedSession()).toBe(false);
    expect(await apiSession.refreshAccessToken()).toBeNull();
    expect(refreshes.count).toBe(0);
  });

  test("ignores a token an older build left for the server guest", async () => {
    await setItemAsync(REFRESH_KEY, "r_old_guest");

    expect(await hasSavedSession()).toBe(false);
  });
});

describe("the account session", () => {
  test("describes the device for sign-in", async () => {
    expect(await deviceInfo()).toEqual(
      expect.objectContaining({ platform: "ios", deviceId: expect.any(String) }),
    );
  });

  test("keeps the tokens after sign-in", async () => {
    await signIn();

    expect(await hasSavedSession()).toBe(true);
    expect(useSessionStore.getState().accessToken).toBe("a_1");
  });

  test("refreshes once for three requests with an expired token (NET-09)", async () => {
    await signIn();
    const refreshes = watchRequests("/auth/refresh");
    serveMeFor("a_2");

    const results = await Promise.all([
      apiClient.GET("/me"),
      apiClient.GET("/me"),
      apiClient.GET("/me"),
    ]);

    expect(refreshes.count).toBe(1);
    expect(results.map(({ response }) => response.status)).toEqual([200, 200, 200]);
    expect(await getItemAsync(REFRESH_KEY)).toBe("r_2");
  });

  test("turns into the local guest and offers signing in again when revoked (decision 0050 #8)", async () => {
    await signIn();
    await apiClient.POST("/auth/refresh", { body: { refreshToken: "r_1" } });
    serveMeFor("a_3");

    const { response } = await apiClient.GET("/me");

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect(useAccountStore.getState()).toMatchObject({ hasLogin: false, offer: "signInLost" });
    expect(await getItemAsync(REFRESH_KEY)).toBeNull();
  });

  test("keeps the session on a 401 from the refresh that is not a revocation", async () => {
    await signIn();
    mockServer.use(
      http.post(mockUrl("/auth/refresh"), () =>
        HttpResponse.json({ error: { code: "unauthenticated" } }, { status: HTTP_UNAUTHORIZED }),
      ),
    );

    await expect(apiSession.refreshAccessToken()).rejects.toThrow();

    expect(await getItemAsync(REFRESH_KEY)).toBe("r_1");
  });
});

describe("endSession", () => {
  test("signs out to the local guest (decision 0050 #8)", async () => {
    await signIn();
    const logouts = watchRequests("/auth/logout");

    await endSession();

    expect(logouts.count).toBe(1);
    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(useAccountStore.getState().hasLogin).toBe(false);
    expect(await getItemAsync(REFRESH_KEY)).toBeNull();
  });

  test("keeps the account when the server cannot end the session", async () => {
    await signIn();
    mockServer.use(
      http.post(mockUrl("/auth/logout"), () =>
        HttpResponse.json({ error: { code: "internal_error" } }, { status: 500 }),
      ),
    );

    await expect(endSession()).rejects.toMatchObject({ code: "internal_error" });
    expect(useAccountStore.getState().hasLogin).toBe(true);
  });
});
