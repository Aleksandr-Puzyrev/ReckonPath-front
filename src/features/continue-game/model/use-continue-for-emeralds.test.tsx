import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import type { LevelInput } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";
import { meQueryOptions } from "@entities/wallet";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useContinueForEmeralds } from "./use-continue-for-emeralds";

jest.mock("@shared/haptics", () => ({ haptic: jest.fn() }));

const LEVEL: LevelInput = {
  v: 2,
  id: "c-continue",
  rows: 4,
  cols: 4,
  targets: [[3, 3]],
  probeMode: "distance",
  moveLimit: 2,
  stars: [1, 2],
};

const loseGame = () => {
  useGameSessionStore.getState().start(LEVEL, "new");
  useGameSessionStore.getState().tap(0);
  useGameSessionStore.getState().tap(1);
};

const callbacks = () => ({
  onContinued: jest.fn(),
  onShortOfEmeralds: jest.fn(),
  onError: jest.fn(),
});

const renderContinue = async (handlers: ReturnType<typeof callbacks>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const view = await renderHook(() => useContinueForEmeralds(handlers), { wrapper });
  await waitFor(() => expect(queryClient.getQueryData(meQueryOptions().queryKey)).toBeDefined());
  // Query updates reach the hook on the next macrotask (обновления запроса доходят до хука на следующей макрозадаче).
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  return { ...view, queryClient };
};

beforeEach(() => {
  useGameSessionStore.getState().reset();
  loseGame();
});

afterEach(async () => {
  mockServer.reset();
  await act(async () => onlineManager.setOnline(true));
});

describe("useContinueForEmeralds", () => {
  test("pays on the server, then adds three moves and the new balance (LVL-13)", async () => {
    const handlers = callbacks();
    const { result, queryClient } = await renderContinue(handlers);

    await act(async () => result.current.handlePress());

    await waitFor(() => expect(handlers.onContinued).toHaveBeenCalled());
    expect(useGameSessionStore.getState().game).toMatchObject({ status: "playing", bonusMoves: 3 });
    expect(queryClient.getQueryData(meQueryOptions().queryKey)?.wallet.emeralds).toBe(2625);
  });

  test("opens the ways to earn when emeralds are short, adding nothing (LVL-17)", async () => {
    mockServer.use(
      http.get(mockUrl("/me"), () => HttpResponse.json({ wallet: { emeralds: 10, coins: 0 } })),
    );
    const handlers = callbacks();
    const { result } = await renderContinue(handlers);

    expect(result.current.canAfford).toBe(false);
    await act(async () => result.current.handlePress());

    expect(handlers.onShortOfEmeralds).toHaveBeenCalledWith(5);
    expect(useGameSessionStore.getState().game?.status).toBe("lost");
  });

  test("trusts the server when it says the emeralds are short", async () => {
    mockServer.use(
      http.post(mockUrl("/continue"), () =>
        HttpResponse.json(
          { error: { code: "INSUFFICIENT_FUNDS", details: { need: 7 } } },
          { status: 422 },
        ),
      ),
    );
    const handlers = callbacks();
    const { result } = await renderContinue(handlers);

    await act(async () => result.current.handlePress());

    await waitFor(() => expect(handlers.onShortOfEmeralds).toHaveBeenCalledWith(7));
    expect(handlers.onContinued).not.toHaveBeenCalled();
  });

  test("tells about a lost connection and adds nothing", async () => {
    mockServer.use(http.post(mockUrl("/continue"), () => HttpResponse.error()));
    const handlers = callbacks();
    const { result } = await renderContinue(handlers);

    await act(async () => result.current.handlePress());

    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.NETWORK"));
    expect(useGameSessionStore.getState().game?.status).toBe("lost");
  });

  test("refuses an online continue for a game without an attempt id", async () => {
    useGameSessionStore.setState({ attemptId: null });
    const handlers = callbacks();
    const { result } = await renderContinue(handlers);

    await act(async () => result.current.handlePress());

    expect(handlers.onError).toHaveBeenCalledWith("errors.generic");
    expect(useGameSessionStore.getState().game?.status).toBe("lost");
  });

  test("continues offline on the last known balance, charging with the attempt", async () => {
    const handlers = callbacks();
    const { result, queryClient } = await renderContinue(handlers);
    await act(async () => onlineManager.setOnline(false));

    await act(async () => result.current.handlePress());

    expect(handlers.onContinued).toHaveBeenCalled();
    expect(useGameSessionStore.getState().actions.at(-1)).toEqual({
      type: "continue",
      method: "emeralds",
    });
    expect(queryClient.getQueryData(meQueryOptions().queryKey)?.wallet.emeralds).toBe(2640);
  });
});
