import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { meQueryOptions } from "@entities/wallet";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useRestoreStreak } from "./use-restore-streak";

const PRICE = 30;

const callbacks = () => ({
  onRestored: jest.fn(),
  onShortOfEmeralds: jest.fn(),
  onError: jest.fn(),
});

const renderRestore = async (handlers: ReturnType<typeof callbacks>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const view = await renderHook(() => useRestoreStreak(PRICE, handlers), { wrapper });
  await waitFor(() => expect(queryClient.getQueryData(meQueryOptions().queryKey)).toBeDefined());
  // Query updates reach the hook on the next macrotask (обновления запроса доходят до хука на следующей макрозадаче).
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  return { ...view, queryClient };
};

afterEach(() => mockServer.reset());

describe("useRestoreStreak", () => {
  test("pays on the server and takes the new balance (DLY-09)", async () => {
    const handlers = callbacks();
    const { result, queryClient } = await renderRestore(handlers);

    await act(async () => result.current.handleRestore());

    await waitFor(() => expect(handlers.onRestored).toHaveBeenCalled());
    expect(queryClient.getQueryData(meQueryOptions().queryKey)?.wallet.emeralds).toBe(2610);
  });

  test("opens the ways to earn when emeralds are short, sending nothing", async () => {
    mockServer.use(
      http.get(mockUrl("/me"), () => HttpResponse.json({ wallet: { emeralds: 10, coins: 0 } })),
    );
    const handlers = callbacks();
    const { result } = await renderRestore(handlers);

    expect(result.current.canAfford).toBe(false);
    await act(async () => result.current.handleRestore());

    expect(handlers.onShortOfEmeralds).toHaveBeenCalledWith(20);
    expect(handlers.onRestored).not.toHaveBeenCalled();
  });

  test("trusts the server when it says the emeralds are short", async () => {
    mockServer.use(
      http.post(mockUrl("/streak/restore"), () =>
        HttpResponse.json(
          { error: { code: "INSUFFICIENT_FUNDS", details: { need: 7 } } },
          { status: 422 },
        ),
      ),
    );
    const handlers = callbacks();
    const { result } = await renderRestore(handlers);

    await act(async () => result.current.handleRestore());

    await waitFor(() => expect(handlers.onShortOfEmeralds).toHaveBeenCalledWith(7));
    expect(handlers.onRestored).not.toHaveBeenCalled();
  });

  test("tells about a lost connection and charges nothing", async () => {
    mockServer.use(http.post(mockUrl("/streak/restore"), () => HttpResponse.error()));
    const handlers = callbacks();
    const { result, queryClient } = await renderRestore(handlers);

    await act(async () => result.current.handleRestore());

    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.NETWORK"));
    expect(queryClient.getQueryData(meQueryOptions().queryKey)?.wallet.emeralds).toBe(2640);
  });
});
