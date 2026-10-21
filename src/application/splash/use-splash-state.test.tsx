import { act, renderHook } from "@testing-library/react-native";
import { delay, http, HttpResponse } from "msw";

import { bootstrapMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { SPLASH_MAX_MS, useSplashState } from "./use-splash-state";

const SLOW_MS = 10_000;

describe("useSplashState", () => {
  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("hides the splash once the bootstrap answers (Part 4 §2.1)", async () => {
    const { result } = await renderHook(() => useSplashState(), { wrapper: createQueryWrapper() });
    expect(result.current.isVisible).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current).toEqual({ isVisible: false, isUpdating: false });
  });

  test("opens the app after 2.5 s on a slow network with «Обновляем…» (design 29.6)", async () => {
    jest.useFakeTimers();
    mockServer.use(
      http.get(mockUrl("/bootstrap"), async () => {
        await delay(SLOW_MS);
        return HttpResponse.json(bootstrapMock());
      }),
    );
    const { result } = await renderHook(() => useSplashState(), { wrapper: createQueryWrapper() });

    await act(() => jest.advanceTimersByTimeAsync(SPLASH_MAX_MS));

    expect(result.current).toEqual({ isVisible: false, isUpdating: true });
  });
});
