import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useAsyncMatchStore } from "@entities/match";
import type { AsyncMatch } from "@entities/match";
import { useSettingsStore } from "@entities/settings";
import { apiClient } from "@shared/api";
import { setMockAsyncMap } from "@shared/api/mocks/async-handlers";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaAsyncScreen from "./arena-async-screen";

const mockRouter = { replace: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("expo-keep-awake", () => ({ useKeepAwake: () => undefined }));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({
  useBoardFx: () => ({ play: jest.fn() }),
  BoardRemote: ({ onCellPress }: { onCellPress: (idx: number) => void }) => {
    const { Pressable, View } = jest.requireActual("react-native");
    return (
      <View>
        {[0, 4, 24].map((idx) => (
          <Pressable key={idx} testID={`cell-${idx}`} onPress={() => onCellPress(idx)} />
        ))}
      </View>
    );
  },
}));

const MAP = {
  rows: 5,
  cols: 5,
  targets: [[4, 4]] as [number, number][],
  bombs: [[0, 4]] as [number, number][],
};

const startMatch = async () => {
  setMockAsyncMap(MAP, 3);
  const { data } = await apiClient.POST("/arena/async");
  // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
  useAsyncMatchStore.getState().start(data as AsyncMatch, 0);
  await render(<ArenaAsyncScreen />, { wrapper: createQueryWrapper() });
  await fireEvent(screen.getByTestId("async-board-area"), "layout", {
    nativeEvent: { layout: { width: 320 } },
  });
};

describe("ArenaAsyncScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.replace.mockClear());

  afterEach(async () => {
    await cleanup();
    useAsyncMatchStore.getState().reset();
    mockServer.reset();
  });

  test("shows the author and the norm instead of an opponent (decision 0036 #4)", async () => {
    await startMatch();

    expect(screen.getByText("Автор карты")).toBeOnTheScreen();
    expect(screen.getByText("Норма: 3 хода")).toBeOnTheScreen();
    expect(screen.getByText("Ход 1 / 40")).toBeOnTheScreen();
  });

  test("counts a bomb as one more turn with a toast", async () => {
    await startMatch();

    await fireEvent.press(screen.getByTestId("cell-4"));

    expect(await screen.findByText("Бомба: +1 ход к итогу")).toBeOnTheScreen();
    expect(screen.getByText("Ход 3 / 40")).toBeOnTheScreen();
  });

  test("goes to the async result once the targets are found (ARN-12)", async () => {
    await startMatch();

    await fireEvent.press(screen.getByTestId("cell-24"));

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/arena/result/[id]",
        params: { id: "async_1", mode: "async" },
      }),
    );
    expect(useAsyncMatchStore.getState().finish?.result).toBe("win");
  });

  test("asks for a second tap when the PvP tap confirmation is on (decision 0040 #7)", async () => {
    useSettingsStore.getState().togglePvpTapConfirm();
    await startMatch();

    await fireEvent.press(screen.getByTestId("cell-24"));
    expect(useAsyncMatchStore.getState().taps).toHaveLength(0);
    await fireEvent.press(screen.getByTestId("cell-24"));

    await waitFor(() => expect(useAsyncMatchStore.getState().finish?.result).toBe("win"));
    useSettingsStore.getState().reset();
  });

  test("gives up after a confirmation (decision 0036 #1)", async () => {
    await startMatch();

    await fireEvent.press(screen.getByTestId("async-menu"));
    await fireEvent.press(screen.getByTestId("async-surrender"));
    await fireEvent.press(
      screen.getAllByText("Сдаться").at(-1) ?? screen.getByTestId("async-menu"),
    );

    await waitFor(() => expect(useAsyncMatchStore.getState().finish?.result).toBe("loss"));
  });
});
