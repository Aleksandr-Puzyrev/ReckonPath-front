import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { bootstrapQueryOptions, useBootstrapQuery } from "@entities/app-config";
import { apiClient } from "@shared/api";
import { bootstrapMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { useSystemSignalRefetch } from "./use-system-signal-refetch";

const HTTP_UPGRADE_REQUIRED = 426;

const setup = async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = await renderHook(
    () => {
      useSystemSignalRefetch();
      return useBootstrapQuery();
    },
    { wrapper },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  return queryClient;
};

const countBootstrapRequests = () => {
  const counter = { count: 0 };
  mockServer.use(
    http.get(mockUrl("/bootstrap"), () => {
      counter.count += 1;
      return HttpResponse.json(bootstrapMock());
    }),
  );
  return counter;
};

afterEach(() => mockServer.reset());

describe("useSystemSignalRefetch", () => {
  test("re-reads the bootstrap after a 426 from another request (NET-03)", async () => {
    const queryClient = await setup();
    const bootstrap = countBootstrapRequests();
    mockServer.use(
      http.get(mockUrl("/me"), () =>
        HttpResponse.json(
          { error: { code: "UPGRADE_REQUIRED" } },
          { status: HTTP_UPGRADE_REQUIRED },
        ),
      ),
    );

    await apiClient.GET("/me");

    await waitFor(() => expect(bootstrap.count).toBe(1));
    expect(queryClient.getQueryState(bootstrapQueryOptions().queryKey)?.status).toBe("success");
  });

  test("does not loop when the bootstrap itself answers 426", async () => {
    const queryClient = await setup();
    let requests = 0;
    mockServer.use(
      http.get(mockUrl("/bootstrap"), () => {
        requests += 1;
        return HttpResponse.json(
          { error: { code: "UPGRADE_REQUIRED" } },
          { status: HTTP_UPGRADE_REQUIRED },
        );
      }),
    );

    await queryClient.refetchQueries({ queryKey: bootstrapQueryOptions().queryKey });

    expect(requests).toBe(1);
  });
});
