import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import type { Price } from "@entities/item";
import { useAccountStore } from "@entities/session";
import { meQueryOptions } from "@entities/wallet";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { usePurchaseItem } from "./use-purchase-item";
import type { PurchaseTarget } from "./use-purchase-item";

const callbacks = () => ({
  onShortOf: jest.fn(),
  onPurchased: jest.fn(),
  onOwned: jest.fn(),
  onEnded: jest.fn(),
  onError: jest.fn(),
});

let queryClient = new QueryClient();

const renderPurchase = async (
  target: PurchaseTarget,
  price: Price,
  handlers: ReturnType<typeof callbacks>,
) => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const view = await renderHook(() => usePurchaseItem(target, price, handlers), { wrapper });
  await waitFor(() => expect(queryClient.getQueryData(meQueryOptions().queryKey)).toBeDefined());
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  return view;
};

const balance = () => queryClient.getQueryData(meQueryOptions().queryKey)?.wallet;

const failWith = (code: string, details?: Record<string, unknown>) =>
  mockServer.use(
    http.post(mockUrl("/shop/purchase"), () =>
      HttpResponse.json({ error: { code, details } }, { status: 422 }),
    ),
  );

describe("usePurchaseItem", () => {
  beforeEach(() => useAccountStore.getState().markSignedIn());

  afterEach(async () => {
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    mockServer.reset();
    useAccountStore.getState().reset();
  });

  test("asks to confirm from ◆ 500, then buys and lowers the balance (SHP-01)", async () => {
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "night" }, { emeralds: 1680 }, handlers);

    await act(async () => result.current.handleBuy());
    expect(result.current.isConfirming).toBe(true);
    expect(result.current.balanceAfter).toBe(960);
    await act(async () => result.current.handleConfirm());

    await waitFor(() => expect(handlers.onPurchased).toHaveBeenCalled());
    expect(balance()?.emeralds).toBe(960);
  });

  test("buys a cheaper item at once", async () => {
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "reef" }, { emeralds: 480 }, handlers);

    await act(async () => result.current.handleBuy());

    expect(result.current.isConfirming).toBe(false);
    await waitFor(() => expect(handlers.onPurchased).toHaveBeenCalled());
  });

  test("buys for coins without a confirmation", async () => {
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "fence_neon" }, { coins: 4200 }, handlers);

    await act(async () => result.current.handleBuy());

    await waitFor(() => expect(handlers.onPurchased).toHaveBeenCalled());
    expect(balance()?.coins).toBe(14220);
  });

  test("tells how much is short and sends nothing (SHP-02)", async () => {
    mockServer.use(
      http.get(mockUrl("/me"), () => HttpResponse.json({ wallet: { emeralds: 1000, coins: 0 } })),
    );
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "night" }, { emeralds: 1680 }, handlers);

    await act(async () => result.current.handleBuy());

    expect(handlers.onShortOf).toHaveBeenCalledWith(680, "emeralds");
    expect(result.current.isConfirming).toBe(false);
  });

  test("offers linking to a guest before the first ◆ purchase, then buys (decision 0023 #4)", async () => {
    useAccountStore.getState().reset();
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "reef" }, { emeralds: 480 }, handlers);

    await act(async () => result.current.handleBuy());
    expect(useAccountStore.getState().offer).toBe("purchase");
    expect(handlers.onPurchased).not.toHaveBeenCalled();

    await act(async () => result.current.handleBuy());

    await waitFor(() => expect(handlers.onPurchased).toHaveBeenCalled());
  });

  test("turns the button to equip for an item bought elsewhere (SHP-05)", async () => {
    failWith("ALREADY_OWNED");
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "reef" }, { emeralds: 480 }, handlers);

    await act(async () => result.current.handleBuy());

    await waitFor(() => expect(handlers.onOwned).toHaveBeenCalled());
  });

  test.each(["OFFER_ENDED", "SOLD_OUT"])("reports %s (SHP-06, SHP-07)", async (code) => {
    failWith(code);
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "reef" }, { emeralds: 480 }, handlers);

    await act(async () => result.current.handleBuy());

    await waitFor(() => expect(handlers.onEnded).toHaveBeenCalledWith(code));
  });

  test("shows the new price and asks again at any amount (E3-1)", async () => {
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "reef" }, { emeralds: 400 }, handlers);

    await act(async () => result.current.handleBuy());
    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.PRICE_CHANGED"));
    expect(result.current.price).toEqual({ emeralds: 480 });

    await act(async () => result.current.handleBuy());

    expect(result.current.isConfirming).toBe(true);
  });

  test("retries a lost connection with the same key and charges once (SHP-03)", async () => {
    jest.useFakeTimers({ advanceTimers: true });
    const keys: string[] = [];
    let isFirst = true;
    mockServer.use(
      http.post(mockUrl("/shop/purchase"), ({ request }) => {
        keys.push(request.headers.get("Idempotency-Key") ?? "");
        if (!isFirst) return undefined;
        isFirst = false;
        return HttpResponse.error();
      }),
    );
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "reef" }, { emeralds: 480 }, handlers);

    await act(async () => result.current.handleBuy());
    await act(() => jest.advanceTimersByTimeAsync(1_000));

    await waitFor(() => expect(handlers.onPurchased).toHaveBeenCalled());
    expect(keys).toHaveLength(2);
    expect(keys[1]).toBe(keys[0]);
    expect(balance()?.emeralds).toBe(2160);
    jest.useRealTimers();
  });

  test("checks the shortage before the link offer, keeping it for a real purchase (decision 0023 #19)", async () => {
    useAccountStore.getState().reset();
    mockServer.use(
      http.get(mockUrl("/me"), () => HttpResponse.json({ wallet: { emeralds: 100, coins: 0 } })),
    );
    const handlers = callbacks();
    const { result } = await renderPurchase({ itemId: "reef" }, { emeralds: 480 }, handlers);

    await act(async () => result.current.handleBuy());

    expect(handlers.onShortOf).toHaveBeenCalledWith(380, "emeralds");
    expect(useAccountStore.getState().isPurchaseOfferUsed).toBe(false);
  });
});
