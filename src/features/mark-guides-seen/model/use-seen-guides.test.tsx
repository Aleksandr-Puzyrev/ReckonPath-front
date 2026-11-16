import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { campaignQueryOptions } from "@entities/level";
import { TUTORIAL_KEYS, useRulesStore } from "@entities/rules";
import { mockCampaignState, mockServer } from "@shared/test-utils/api-mock";

import { useSeenGuides } from "./use-seen-guides";

const renderGuides = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  // The overview is loaded first, so the hook's first render already knows the server keys (обзор загружается заранее, чтобы первый рендер хука уже знал ключи сервера).
  await queryClient.prefetchQuery(campaignQueryOptions());
  return renderHook(() => useSeenGuides(), { wrapper });
};

describe("useSeenGuides", () => {
  beforeEach(() => useRulesStore.getState().reset());

  afterEach(() => mockServer.reset());

  test("sends the Home tour to the server and keeps it on the device at once", async () => {
    const { result } = await renderGuides();

    result.current.markHomeTourSeen();

    expect(useRulesStore.getState().hasSeenHomeTour).toBe(true);
    await waitFor(() => expect(mockCampaignState().tutorials).toEqual(["home_tour"]));
  });

  test("reads the app's hints the server keeps from another device", async () => {
    const before = await renderGuides();
    before.result.current.markHomeTourSeen();
    before.result.current.markTutorialSeen(TUTORIAL_KEYS.movesLimit);
    before.result.current.markArenaEditorSeen();
    before.result.current.markCardsSeen(["flags"]);
    await waitFor(() =>
      expect(mockCampaignState().tutorials).toEqual(
        expect.arrayContaining(["home_tour", "moves_hint", "arena_editor", "flags"]),
      ),
    );
    useRulesStore.getState().reset();

    const { result } = await renderGuides();

    expect(result.current.isArenaEditorSeen).toBe(true);
    expect(result.current.isHomeTourSeen).toBe(true);
    expect(result.current.isTutorialSeen(TUTORIAL_KEYS.movesLimit)).toBe(true);
    expect(result.current.seenCards).toContain("flags");
  });
});
