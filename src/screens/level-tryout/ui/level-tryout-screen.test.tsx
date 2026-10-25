import { cleanup, fireEvent, render, screen } from "@testing-library/react-native";

import { encodeLevel } from "@reckon-path/engine";

import {
  emptyDraft,
  levelOfDraft,
  useLevelEditorStore,
  useTryoutBestStore,
} from "@entities/custom-level";
import { useGameSessionStore } from "@entities/level";
import { i18n } from "@shared/i18n";

import LevelTryoutScreen from "./level-tryout-screen";

const mockRouter = { back: jest.fn(), navigate: jest.fn() };
const mockParams: { c?: string } = {};

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock("@widgets/board", () => ({
  useBoardFx: () => ({ play: jest.fn() }),
  BoardLocal: ({
    onCellPress,
    isHiddenShown,
  }: {
    onCellPress: (idx: number) => void;
    isHiddenShown: boolean;
  }) => {
    const { Pressable, View } = jest.requireActual("react-native");
    return (
      <View testID={isHiddenShown ? "board-shown" : "board-hidden"}>
        {[0, 1, 24].map((cell) => (
          <Pressable key={cell} testID={`cell-${cell}`} onPress={() => onCellPress(cell)} />
        ))}
      </View>
    );
  },
}));

const renderTryout = async () => {
  const draft = emptyDraft("Бухта", 5, 5, "distance");
  useLevelEditorStore.getState().open(
    "new",
    {
      ...draft,
      map: { ...draft.map, targets: [[4, 4]] },
      params: { ...draft.params, moveLimit: 1 },
    },
    null,
  );
  await render(<LevelTryoutScreen />);
  await fireEvent(screen.getByTestId("tryout-board-area"), "layout", {
    nativeEvent: { layout: { width: 320, height: 320 } },
  });
};

describe("LevelTryoutScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    Object.values(mockRouter).forEach((mock) => mock.mockClear());
    mockParams.c = undefined;
  });

  afterEach(async () => {
    await cleanup();
    useLevelEditorStore.getState().reset();
    useTryoutBestStore.getState().reset();
  });

  test("plays the draft with its real limit and finds the target (decision 0043 #8)", async () => {
    await renderTryout();
    expect(screen.getByText("Бухта")).toBeOnTheScreen();
    expect(screen.getByText("1 / 1")).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId("cell-24"));

    expect(screen.getByText("Сигнал найден")).toBeOnTheScreen();
  });

  test("runs out of moves and starts again or goes back to the editor", async () => {
    await renderTryout();

    await fireEvent.press(screen.getByTestId("cell-0"));
    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("tryout-again"));
    expect(screen.queryByTestId("tryout-result")).toBeNull();
    await fireEvent.press(screen.getByTestId("tryout-back"));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("keeps the saved campaign game untouched", async () => {
    useGameSessionStore.setState({ levelId: "c-5", actions: [{ type: "tap", cell: 3 }] });
    await renderTryout();

    await fireEvent.press(screen.getByTestId("cell-24"));

    expect(useGameSessionStore.getState()).toMatchObject({ levelId: "c-5" });
    useGameSessionStore.getState().reset();
  });

  test("remembers the author's best result for the challenge (decision 0044 #1)", async () => {
    await renderTryout();

    await fireEvent.press(screen.getByTestId("cell-24"));

    expect(Object.values(useTryoutBestStore.getState().best)).toEqual([1]);
  });

  test("plays a code with hidden targets and compares with the author's challenge (decision 0044 #3)", async () => {
    const draft = emptyDraft("Бухта", 5, 5, "distance");
    const level = levelOfDraft({ ...draft, map: { ...draft.map, targets: [[4, 4]] } }, null, 2);
    mockParams.c = encodeLevel(level, 1);
    await render(<LevelTryoutScreen />);
    await fireEvent(screen.getByTestId("tryout-board-area"), "layout", {
      nativeEvent: { layout: { width: 320, height: 320 } },
    });
    expect(screen.getByTestId("board-hidden")).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId("cell-0"));
    await fireEvent.press(screen.getByTestId("cell-24"));

    expect(screen.getByText("Твой результат: 2 хода · Вызов автора: 1 ход")).toBeOnTheScreen();
    expect(screen.getByText("Вызов не побит — попробуй ещё")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("tryout-editor"));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/levels");
    expect(useTryoutBestStore.getState().best).toEqual({});
  });

  const playCode = async (challenge: number) => {
    const draft = emptyDraft("Бухта", 5, 5, "distance");
    const map = { ...draft.map, targets: [[4, 4]] as [number, number][] };
    mockParams.c = encodeLevel(
      levelOfDraft({ ...draft, map, params: { ...draft.params, moveLimit: 2 } }, null, 2),
      challenge,
    );
    await render(<LevelTryoutScreen />);
    await fireEvent(screen.getByTestId("tryout-board-area"), "layout", {
      nativeEvent: { layout: { width: 320, height: 320 } },
    });
  };

  test("beats the challenge only with fewer moves (decision 0044 #10)", async () => {
    await playCode(2);

    await fireEvent.press(screen.getByTestId("cell-24"));

    expect(screen.getByText("Вызов побит!")).toBeOnTheScreen();
  });

  test("does not count an equal result as beating it", async () => {
    await playCode(1);

    await fireEvent.press(screen.getByTestId("cell-24"));

    expect(screen.getByText("Вызов не побит — попробуй ещё")).toBeOnTheScreen();
  });

  test("shows the challenge after a loss without the player's result (decision 0044 #11)", async () => {
    await playCode(1);

    await fireEvent.press(screen.getByTestId("cell-0"));
    await fireEvent.press(screen.getByTestId("cell-1"));

    expect(screen.getByText("Ходы закончились")).toBeOnTheScreen();
    expect(screen.getByText("Вызов автора: 1 ход")).toBeOnTheScreen();
    expect(screen.getByText("Вызов не побит — попробуй ещё")).toBeOnTheScreen();
  });
});
