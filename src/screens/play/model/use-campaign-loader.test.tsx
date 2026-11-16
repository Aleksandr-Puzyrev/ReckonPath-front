import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useRulesStore } from "@entities/rules";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useCampaignLoader } from "./use-campaign-loader";

const HTTP_SERVER_ERROR = 500;

const renderLoader = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const view = await renderHook(() => useCampaignLoader(1), { wrapper });
  await waitFor(() => expect(view.result.current.load.kind).toBe("ready"));
  return { ...view, queryClient };
};

describe("useCampaignLoader", () => {
  beforeEach(() => {
    useRulesStore.getState().reset();
    useRulesStore.getState().skipTutorial();
  });

  afterEach(() => mockServer.reset());

  test("keeps the game when a background refetch of the level fails", async () => {
    const { result, queryClient } = await renderLoader();
    mockServer.use(
      http.get(mockUrl("/campaign/levels/:number"), () =>
        HttpResponse.json({ error: { code: "internal" } }, { status: HTTP_SERVER_ERROR }),
      ),
    );

    await act(async () => queryClient.refetchQueries({ type: "active" }));

    expect(result.current.load.kind).toBe("ready");
  });

  test("starts a new game on the server on restart", async () => {
    const { result } = await renderLoader();
    const before = result.current.load.kind === "ready" ? result.current.load.game.id : null;

    await act(async () => result.current.restart());

    await waitFor(() =>
      expect(result.current.load.kind === "ready" && result.current.load.game.id).not.toBe(before),
    );
    expect(result.current.load.kind).toBe("ready");
  });
});
