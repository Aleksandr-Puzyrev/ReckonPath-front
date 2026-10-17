import { renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { bootstrapMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useConfigNumber } from "./use-config-number";

const serveConfig = (config: Record<string, unknown>) =>
  mockServer.use(
    http.get(mockUrl("/bootstrap"), () => HttpResponse.json({ ...bootstrapMock(), config })),
  );

describe("useConfigNumber", () => {
  afterEach(() => mockServer.reset());

  test("reads a number from the remote config", async () => {
    serveConfig({ "ads.interstitial.everyN": 4 });

    const { result } = await renderHook(() => useConfigNumber("ads.interstitial.everyN", 3), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current).toBe(4));
  });

  test("falls back to the spec value for a missing or non-number key", async () => {
    serveConfig({ "ads.interstitial.everyN": "4" });

    const { result } = await renderHook(
      () => [useConfigNumber("ads.interstitial.everyN", 3), useConfigNumber("missing", 7)],
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current).toEqual([3, 7]));
  });
});
