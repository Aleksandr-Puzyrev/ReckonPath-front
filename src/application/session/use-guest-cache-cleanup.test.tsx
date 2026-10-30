import { IsRestoringProvider, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { appConfigKeys } from "@entities/app-config";
import { useAccountStore } from "@entities/session";

import { useGuestCacheCleanup } from "./use-guest-cache-cleanup";

const ME_KEY = ["me"];

const renderCleanup = async (queryClient: QueryClient) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  await renderHook(useGuestCacheCleanup, { wrapper });
};

const filledClient = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  queryClient.setQueryData(ME_KEY, { nickname: "Nova" });
  queryClient.setQueryData(appConfigKeys.version(), { forceUpdate: false });
  return queryClient;
};

describe("useGuestCacheCleanup (decision 0051)", () => {
  afterEach(() => useAccountStore.getState().reset());

  test("drops an account's data a guest finds on start, keeping the app config", async () => {
    const queryClient = filledClient();

    await renderCleanup(queryClient);

    expect(queryClient.getQueryData(ME_KEY)).toBeUndefined();
    expect(queryClient.getQueryData(appConfigKeys.version())).toBeDefined();
  });

  test("waits for the saved cache to come back before dropping it", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    let isRestoring = true;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <IsRestoringProvider value={isRestoring}>{children}</IsRestoringProvider>
      </QueryClientProvider>
    );
    const { rerender } = await renderHook(useGuestCacheCleanup, { wrapper });

    queryClient.setQueryData(ME_KEY, { nickname: "Nova" });
    isRestoring = false;
    await rerender({});

    expect(queryClient.getQueryData(ME_KEY)).toBeUndefined();
  });

  test("drops the account's data once the account turns into a guest", async () => {
    useAccountStore.getState().markSignedIn();
    const queryClient = filledClient();
    await renderCleanup(queryClient);
    expect(queryClient.getQueryData(ME_KEY)).toBeDefined();

    await act(async () => useAccountStore.getState().loseSignIn());

    expect(queryClient.getQueryData(ME_KEY)).toBeUndefined();
  });
});
