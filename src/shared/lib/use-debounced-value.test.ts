import { act, renderHook } from "@testing-library/react-native";

import { useDebouncedValue } from "./use-debounced-value";

const DELAY_MS = 300;

describe("useDebouncedValue", () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(() => jest.useRealTimers());

  test("keeps the old value until the delay passes", async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "Ki" } },
    );

    await rerender({ value: "Kir" });
    expect(result.current).toBe("Ki");

    await act(async () => jest.advanceTimersByTime(DELAY_MS));
    expect(result.current).toBe("Kir");
  });

  test("restarts the delay on every change", async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "K" } },
    );

    await rerender({ value: "Ki" });
    await act(async () => jest.advanceTimersByTime(DELAY_MS - 1));
    await rerender({ value: "Kir" });
    await act(async () => jest.advanceTimersByTime(DELAY_MS - 1));
    expect(result.current).toBe("K");

    await act(async () => jest.advanceTimersByTime(1));
    expect(result.current).toBe("Kir");
  });
});
