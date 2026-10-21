import { act, renderHook } from "@testing-library/react-native";

import { useSettingsStore } from "@entities/settings";

import { useTapConfirm } from "./use-tap-confirm";

describe("useTapConfirm", () => {
  afterEach(() => useSettingsStore.getState().reset());

  test("sends at once while the confirmation is off (decision 0040 #7)", async () => {
    const { result } = await renderHook(() => useTapConfirm("turn-1"));

    expect(result.current.shouldSend(4)).toBe(true);
  });

  test("selects first, moves the selection and sends on the second tap", async () => {
    useSettingsStore.getState().togglePvpTapConfirm();
    const { result } = await renderHook(() => useTapConfirm("turn-1"));

    await act(() => expect(result.current.shouldSend(4)).toBe(false));
    expect(result.current.selected).toBe(4);
    await act(() => expect(result.current.shouldSend(7)).toBe(false));
    expect(result.current.selected).toBe(7);
    await act(() => expect(result.current.shouldSend(7)).toBe(true));

    expect(result.current.selected).toBeNull();
  });

  test("forgets the selection in another turn or the flag mode", async () => {
    useSettingsStore.getState().togglePvpTapConfirm();
    const { result, rerender } = await renderHook(
      ({ scope }: { scope: string | null }) => useTapConfirm(scope),
      { initialProps: { scope: "turn-1" as string | null } },
    );
    await act(() => expect(result.current.shouldSend(4)).toBe(false));

    await rerender({ scope: null });
    expect(result.current.selected).toBeNull();
    await rerender({ scope: "turn-3" });

    expect(result.current.selected).toBeNull();
    await act(() => expect(result.current.shouldSend(4)).toBe(false));
  });
});
