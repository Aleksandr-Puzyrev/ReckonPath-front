import { act, renderHook } from "@testing-library/react-native";

import { useTurnCountdown } from "./use-turn-countdown";

describe("useTurnCountdown", () => {
  beforeEach(() => jest.useFakeTimers({ now: 1_000_000 }));

  afterEach(() => jest.useRealTimers());

  test("counts down to the server deadline (NET-07)", async () => {
    const { result } = await renderHook(() => useTurnCountdown(1_000_000 + 5_300));
    expect(result.current).toBe(5_300);

    await act(async () => jest.advanceTimersByTime(2_000));

    expect(result.current).toBe(3_300);
  });

  test("stops at zero", async () => {
    const { result } = await renderHook(() => useTurnCountdown(1_000_000 + 500));

    await act(async () => jest.advanceTimersByTime(2_000));

    expect(result.current).toBe(0);
  });
});
