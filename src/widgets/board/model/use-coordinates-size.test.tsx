import { act, renderHook } from "@testing-library/react-native";
import { UnistylesRuntime } from "react-native-unistyles";

import { useSettingsStore } from "@entities/settings";

import { useCoordinatesSize } from "./use-coordinates-size";

const BOARD_WIDTH = 320;

describe("useCoordinatesSize", () => {
  afterEach(() => useSettingsStore.getState().reset());

  test("leaves a strip for A1…G7 by default (decision 0040 #6)", async () => {
    const strip = UnistylesRuntime.getTheme().sizes.arena.coordinates;
    const { result } = await renderHook(() => useCoordinatesSize(BOARD_WIDTH));

    expect(result.current).toEqual({ isCoordinatesOn: true, boardSize: BOARD_WIDTH - strip });
  });

  test("gives the whole width to the board when coordinates are off", async () => {
    const { result } = await renderHook(() => useCoordinatesSize(BOARD_WIDTH));

    await act(() => useSettingsStore.getState().toggleCoordinates());

    expect(result.current).toEqual({ isCoordinatesOn: false, boardSize: BOARD_WIDTH });
  });
});
