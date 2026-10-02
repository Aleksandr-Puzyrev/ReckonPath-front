import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { setItemAsync } from "expo-secure-store";
import { http } from "msw/http";
import type { ReactNode } from "react";
import { AppState } from "react-native";
import type { AppStateStatus } from "react-native";

import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { useSessionStore } from "@entities/session";
import { attemptFixture } from "@shared/test-utils/attempt-fixture";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { OUTBOX_INTERVAL_MS, useAttemptsSync } from "./use-attempts-sync";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const countBatches = () => {
  const counter = { count: 0 };
  mockServer.use(
    http.post(mockUrl("/attempts:batch"), () => {
      counter.count += 1;
      return undefined;
    }),
  );
  return counter;
};

const renderSync = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(useAttemptsSync, { wrapper });
};

const queueAttempt = () => useOutboxStore.getState().enqueue(attemptFixture());

const isQueueEmpty = () => expect(useOutboxStore.getState().attempts).toEqual([]);

afterEach(() => {
  mockServer.reset();
  secureStore.__reset();
  useOutboxStore.getState().reset();
  useProgressStore.getState().reset();
  useSessionStore.getState().reset();
  onlineManager.setOnline(true);
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("useAttemptsSync", () => {
  test("sends the queue on launch", async () => {
    await setItemAsync("reckon-path.refresh-token", "r_saved");
    queueAttempt();

    await renderSync();

    await waitFor(isQueueEmpty);
  });

  test("sends attempts played before the first sign-in once the guest exists (ACC-03)", async () => {
    queueAttempt();
    await renderSync();
    await setItemAsync("reckon-path.refresh-token", "r_1");

    await act(async () => useSessionStore.getState().setAccessToken("a_1"));

    await waitFor(isQueueEmpty);
  });

  test("sends the queue when the network comes back", async () => {
    await setItemAsync("reckon-path.refresh-token", "r_saved");
    onlineManager.setOnline(false);
    await renderSync();
    queueAttempt();

    await act(async () => onlineManager.setOnline(true));

    await waitFor(isQueueEmpty);
  });

  test("sends the queue when the app goes to the background", async () => {
    const listeners: ((state: AppStateStatus) => void)[] = [];
    jest.spyOn(AppState, "addEventListener").mockImplementation((_, listener) => {
      listeners.push(listener);
      return { remove: () => undefined };
    });
    await setItemAsync("reckon-path.refresh-token", "r_saved");
    await renderSync();
    await waitFor(() => expect(useProgressStore.getState().best).toEqual({}));
    const batches = countBatches();
    queueAttempt();

    await act(async () => listeners.forEach((listener) => listener("background")));

    await waitFor(() => expect(batches.count).toBe(1));
  });

  test("sends a waiting queue every minute", async () => {
    jest.useFakeTimers();
    await setItemAsync("reckon-path.refresh-token", "r_saved");
    await renderSync();
    await act(() => jest.advanceTimersByTimeAsync(0));
    const batches = countBatches();
    queueAttempt();

    await act(() => jest.advanceTimersByTimeAsync(OUTBOX_INTERVAL_MS));

    expect(batches.count).toBe(1);
  });

  test("does not call the server every minute with an empty queue", async () => {
    jest.useFakeTimers();
    await setItemAsync("reckon-path.refresh-token", "r_saved");
    await renderSync();
    await act(() => jest.advanceTimersByTimeAsync(0));
    const batches = countBatches();

    await act(() => jest.advanceTimersByTimeAsync(OUTBOX_INTERVAL_MS * 3));

    expect(batches.count).toBe(0);
  });
});
