import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { getItemAsync } from "expo-secure-store";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";
import { AppState } from "react-native";
import type { AppStateStatus } from "react-native";

import { useSessionStore } from "@entities/session";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useGuestSession } from "./use-guest-session";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const HTTP_BAD_REQUEST = 400;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

const renderGuestSession = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(useGuestSession, { wrapper });
};

const failGuestSignIn = (times: number, failure: () => Response) => {
  const counter = { count: 0 };
  mockServer.use(
    http.post(mockUrl("/auth/guest"), () => {
      counter.count += 1;
      return counter.count <= times ? failure() : undefined;
    }),
  );
  return counter;
};

const savedRefreshToken = () => getItemAsync("reckon-path.refresh-token");

afterEach(() => {
  mockServer.reset();
  secureStore.__reset();
  useSessionStore.getState().reset();
  onlineManager.setOnline(true);
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("useGuestSession", () => {
  test("signs in a guest on launch (E2-1)", async () => {
    await renderGuestSession();

    await waitFor(async () => expect(await savedRefreshToken()).not.toBeNull());
  });

  test("registers the guest once the network comes back (ACC-03)", async () => {
    onlineManager.setOnline(false);
    await renderGuestSession();
    expect(await savedRefreshToken()).toBeNull();

    await act(async () => onlineManager.setOnline(true));

    await waitFor(async () => expect(await savedRefreshToken()).not.toBeNull());
  });

  test("retries a failed sign-in after 1, 2 and 4 seconds", async () => {
    jest.useFakeTimers();
    const guest = failGuestSignIn(3, () => HttpResponse.error());
    await renderGuestSession();

    for (const delay of RETRY_DELAYS_MS) {
      await act(() => jest.advanceTimersByTimeAsync(delay));
    }

    expect(guest.count).toBe(4);
    expect(await savedRefreshToken()).not.toBeNull();
  });

  test("does not retry a sign-in the server rejected", async () => {
    jest.useFakeTimers();
    const guest = failGuestSignIn(1, () =>
      HttpResponse.json({ error: { code: "VALIDATION" } }, { status: HTTP_BAD_REQUEST }),
    );
    await renderGuestSession();

    await act(() => jest.advanceTimersByTimeAsync(RETRY_DELAYS_MS.reduce((a, b) => a + b)));

    expect(guest.count).toBe(1);
    expect(await savedRefreshToken()).toBeNull();
  });

  test("tries again on returning to the app while there is no session", async () => {
    const listeners: ((state: AppStateStatus) => void)[] = [];
    jest.spyOn(AppState, "addEventListener").mockImplementation((_, listener) => {
      listeners.push(listener);
      return { remove: () => undefined };
    });
    const guest = failGuestSignIn(1, () =>
      HttpResponse.json({ error: { code: "VALIDATION" } }, { status: HTTP_BAD_REQUEST }),
    );
    await renderGuestSession();
    await waitFor(() => expect(guest.count).toBe(1));

    await act(async () => listeners.forEach((listener) => listener("active")));

    await waitFor(async () => expect(await savedRefreshToken()).not.toBeNull());
  });
});
