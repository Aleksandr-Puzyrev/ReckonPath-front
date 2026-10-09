import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { getItemAsync } from "expo-secure-store";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useDailyRecordStore } from "@entities/daily";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { useAccountStore, useSessionStore } from "@entities/session";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { attemptFixture } from "@shared/test-utils/attempt-fixture";

import { useSignIn } from "./use-sign-in";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const CREDENTIALS = { login: "Nova_58", password: "Signal2026" };

const callbacks = () => ({
  onSignedIn: jest.fn(),
  onWrongCredentials: jest.fn(),
  onError: jest.fn(),
});

let queryClient = new QueryClient();

const renderSignIn = (handlers: ReturnType<typeof callbacks>) => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useSignIn(handlers), { wrapper });
};

const nextMacrotask = () => new Promise((resolve) => setTimeout(resolve, 0));

// Waits inside act until no mutation runs, so their late updates are wrapped too (ждёт внутри act, пока не останется мутаций, чтобы их поздние обновления тоже были обёрнуты).
const settle = () =>
  act(async () => {
    while (queryClient.isMutating() > 0) await nextMacrotask();
    await nextMacrotask();
  });

const playAsGuest = () => {
  useProgressStore.getState().replaceBest({ "c-a": { stars: 3, moves: 1 } });
  useOutboxStore.getState().enqueue(attemptFixture());
};

const watchLogouts = () => {
  const tokens: string[] = [];
  mockServer.use(
    http.post(mockUrl("/auth/logout"), async ({ request }) => {
      const body: unknown = await request.clone().json();
      if (typeof body === "object" && body !== null && "refreshToken" in body)
        tokens.push(String(body.refreshToken));
      return undefined;
    }),
  );
  return tokens;
};

// Before each test, not after: the mounted hook listens to the stores (до каждого теста, а не после: смонтированный хук слушает сторы).
beforeEach(() => {
  useAccountStore.getState().reset();
  useProgressStore.getState().reset();
  useOutboxStore.getState().reset();
  useDailyRecordStore.getState().reset();
  useSessionStore.getState().setAccessToken("a_guest");
});

afterEach(async () => {
  await act(async () => onlineManager.setOnline(true));
  await settle();
  mockServer.reset();
  secureStore.__reset();
});

describe("useSignIn", () => {
  test("puts a wrong login or password under the password field", async () => {
    const handlers = callbacks();
    const { result } = await renderSignIn(handlers);

    await act(async () => result.current.submit({ ...CREDENTIALS, password: "000000" }));

    await waitFor(() =>
      expect(handlers.onWrongCredentials).toHaveBeenCalledWith("errors.INVALID_CREDENTIALS"),
    );
    expect(useSessionStore.getState().accessToken).toBe("a_guest");
  });

  test("fails offline at once and keeps no paused request with the password", async () => {
    mockServer.use(http.post(mockUrl("/auth/login"), () => HttpResponse.error()));
    await act(async () => onlineManager.setOnline(false));
    const handlers = callbacks();
    const { result } = await renderSignIn(handlers);

    await act(async () => result.current.submit(CREDENTIALS));

    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.NETWORK"));
    expect(
      queryClient
        .getMutationCache()
        .getAll()
        .some(({ state }) => state.isPaused),
    ).toBe(false);
    expect(result.current.isPending).toBe(false);
  });

  test("signs in at once when the guest has no progress", async () => {
    const handlers = callbacks();
    const { result } = await renderSignIn(handlers);

    await act(async () => result.current.submit(CREDENTIALS));

    await waitFor(() => expect(handlers.onSignedIn).toHaveBeenCalled());
    expect(result.current.conflict).toBeNull();
    expect(useSessionStore.getState().accessToken).toBe("a_1");
    expect(await getItemAsync("reckon-path.refresh-token")).toBe("r_1");
    expect(useAccountStore.getState().hasLogin).toBe(true);
  });

  test("asks which progress to keep when the guest has played (ACC-06)", async () => {
    playAsGuest();
    const handlers = callbacks();
    const { result } = await renderSignIn(handlers);

    await act(async () => result.current.submit(CREDENTIALS));

    await waitFor(() => expect(result.current.conflict?.summary.level).toBe(58));
    expect(handlers.onSignedIn).not.toHaveBeenCalled();
    expect(useSessionStore.getState().accessToken).toBe("a_guest");
  });

  test("loads the saved account and drops the guest's data (ACC-06)", async () => {
    playAsGuest();
    useDailyRecordStore.getState().recordCounted("2026-09-28", {
      attemptId: "daily-1",
      result: "won",
      movesUsed: 1,
      stars: 3,
      durationMs: 1,
    });
    const handlers = callbacks();
    const { result } = await renderSignIn(handlers);
    await act(async () => result.current.submit(CREDENTIALS));
    await waitFor(() => expect(result.current.conflict).not.toBeNull());

    await act(async () => result.current.handleLoadSaved());
    await settle();

    expect(handlers.onSignedIn).toHaveBeenCalled();
    expect(useProgressStore.getState().best).toEqual({});
    expect(useOutboxStore.getState().attempts).toEqual([]);
    expect(useDailyRecordStore.getState().days).toEqual({});
    expect(useSessionStore.getState().accessToken).toBe("a_1");
    expect(useAccountStore.getState().hasLogin).toBe(true);
  });

  test("keeps the guest and revokes the unused session on cancel (ACC-06)", async () => {
    playAsGuest();
    const logouts = watchLogouts();
    const handlers = callbacks();
    const { result } = await renderSignIn(handlers);
    await act(async () => result.current.submit(CREDENTIALS));
    await waitFor(() => expect(result.current.conflict).not.toBeNull());

    await act(async () => result.current.handleCancelConflict());

    await waitFor(() => expect(logouts).toEqual(["r_1"]));
    expect(result.current.conflict).toBeNull();
    expect(useProgressStore.getState().best).toEqual({ "c-a": { stars: 3, moves: 1 } });
    expect(useSessionStore.getState().accessToken).toBe("a_guest");
    expect(useAccountStore.getState().hasLogin).toBe(false);
  });

  test("revokes the unused session when the screen closes during the choice", async () => {
    playAsGuest();
    const logouts = watchLogouts();
    const { result, unmount } = await renderSignIn(callbacks());
    await act(async () => result.current.submit(CREDENTIALS));
    await waitFor(() => expect(result.current.conflict).not.toBeNull());

    await act(async () => unmount());

    await waitFor(() => expect(logouts).toEqual(["r_1"]));
    expect(useSessionStore.getState().accessToken).toBe("a_guest");
  });
});
