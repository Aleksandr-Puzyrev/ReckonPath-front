import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { useEditorStore } from "@entities/arena-map";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaMapScreen from "./arena-map-screen";

const mockRouter = { back: jest.fn() };
const mockParams = { id: "new" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
}));

type Stroke = {
  onStrokeStart: () => void;
  onStrokeCell: (idx: number, index: number) => void;
  onStrokeEdge: (edge: [number, number], index: number) => void;
  onStrokeEnd: () => void;
};

jest.mock("@widgets/board", () => ({
  useBoardFx: () => ({ play: jest.fn() }),
  BoardEditor: ({ onStrokeStart, onStrokeCell, onStrokeEdge, onStrokeEnd }: Stroke) => {
    const { Pressable, View } = jest.requireActual("react-native");
    const stroke = (cells: number[]) => () => {
      onStrokeStart();
      cells.forEach((cell, index) => onStrokeCell(cell, index));
      onStrokeEnd();
    };
    return (
      <View>
        {Array.from({ length: 25 }, (_, cell) => (
          <Pressable key={cell} testID={`cell-${cell}`} onPress={stroke([cell])} />
        ))}
        <Pressable testID="drag-row" onPress={stroke([5, 6, 7])} />
        <Pressable
          testID="edge-0-1"
          onPress={() => {
            onStrokeStart();
            onStrokeEdge([0, 1], 0);
            onStrokeEnd();
          }}
        />
      </View>
    );
  },
}));

const GOOD_MAP = {
  rows: 5,
  cols: 5,
  targets: [[2, 2]] as [number, number][],
  bombs: [[0, 0]] as [number, number][],
  streams: [
    [1, 2],
    [2, 1],
    [3, 2],
  ] as [number, number][],
};

const saveMap = async (name: string, map = GOOD_MAP) =>
  (await apiClient.POST("/arena/maps", { body: { name, format: 5, map } })).data?.id ?? "";

const renderEditor = async (id = "new") => {
  mockParams.id = id;
  await render(<ArenaMapScreen />, { wrapper: createQueryWrapper() });
  await screen.findByTestId("editor-status");
  await fireEvent(screen.getByTestId("editor-board-area"), "layout", {
    nativeEvent: { layout: { width: 320 } },
  });
};

const tap = (cell: number) => fireEvent.press(screen.getByTestId(`cell-${cell}`));
const choose = (tool: string) => fireEvent.press(screen.getByTestId(`tool-${tool}`));
const status = () => screen.getByTestId("editor-status");

describe("ArenaMapScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.back.mockClear());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useEditorStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("starts a new map named after the first free number", async () => {
    await renderEditor();

    expect(screen.getByText("Карта 1")).toBeOnTheScreen();
    expect(status()).toHaveTextContent("Нужно 1 цели");
    expect(screen.getByText("Сохранить черновик")).toBeOnTheScreen();
  });

  test("places a target and counts it against the format", async () => {
    await renderEditor();

    await tap(12);

    expect(screen.getByLabelText("Цель, 1/1")).toBeOnTheScreen();
  });

  test("refuses an element over the limit with a toast (ARN-14, E4-1)", async () => {
    await renderEditor();
    await tap(12);

    await tap(13);

    expect(await screen.findByText("Лимит: 1")).toBeOnTheScreen();
    expect(screen.getByLabelText("Цель, 1/1")).toBeOnTheScreen();
  });

  test("refuses a rock over a target and a bridge off a stream (ARN-17)", async () => {
    await renderEditor();
    await tap(12);

    await choose("rock");
    await tap(12);
    expect(await screen.findByText("Скалу нельзя поставить на цель или бомбу")).toBeOnTheScreen();

    await choose("bridge");
    await tap(3);
    expect(await screen.findByText("Мост ставится на ручей")).toBeOnTheScreen();
  });

  test("paints streams with one drag and undoes it in one step", async () => {
    await renderEditor();
    await choose("stream");

    await fireEvent.press(screen.getByTestId("drag-row"));
    expect(screen.getByLabelText("Ручей, 3/3")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("editor-undo"));
    expect(screen.getByLabelText("Ручей, 0/3")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("editor-redo"));

    expect(screen.getByLabelText("Ручей, 3/3")).toBeOnTheScreen();
  });

  test("toggles a fence on an edge", async () => {
    await renderEditor();
    await choose("fence");

    await fireEvent.press(screen.getByTestId("edge-0-1"));
    expect(screen.getByLabelText("Забор, 1/3")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("edge-0-1"));

    expect(screen.getByLabelText("Забор, 0/3")).toBeOnTheScreen();
  });

  test("saves a valid map and makes it active (decision 0032 #2)", async () => {
    const id = await saveMap("Fort");
    await renderEditor(id);
    await choose("heavy");
    await tap(20);

    await fireEvent.press(screen.getByTestId("editor-save-big"));

    expect(await screen.findByText("Карта сохранена и активна")).toBeOnTheScreen();
    expect((await apiClient.GET("/arena")).data?.activeMapId).toBe(id);
  });

  test("saves an invalid map as a draft (decision 0032 #1)", async () => {
    await renderEditor();

    await fireEvent.press(screen.getByTestId("editor-save-big"));

    expect(
      await screen.findByText("Сохранено как черновик — активной станет после исправления"),
    ).toBeOnTheScreen();
    const { data } = await apiClient.GET("/arena/maps");
    expect(data).toEqual([expect.objectContaining({ name: "Карта 1", valid: false })]);
  });

  test("tells about the three-map limit (decision 0032 #12)", async () => {
    await saveMap("A");
    await saveMap("B");
    await saveMap("C");
    await renderEditor();

    await fireEvent.press(screen.getByTestId("editor-save-big"));

    expect(await screen.findByText("Можно хранить до 3 карт формата")).toBeOnTheScreen();
  });

  test("asks before replacing a non-empty map with a random one", async () => {
    await renderEditor();
    await tap(12);

    await choose("random");
    await fireEvent.press(await screen.findByText("Заменить"));

    await waitFor(() => expect(status()).toHaveTextContent(/^Карта в порядке/));
  });

  test("asks to save unsaved changes on the way out and can drop them", async () => {
    await renderEditor();
    await tap(12);

    await fireEvent.press(screen.getByTestId("editor-back"));
    await fireEvent.press(await screen.findByText("Не сохранять"));

    expect(mockRouter.back).toHaveBeenCalled();
    expect(useEditorStore.getState().session).toBeNull();
  });

  test("leaves at once without changes", async () => {
    await renderEditor();

    await fireEvent.press(screen.getByTestId("editor-back"));

    expect(mockRouter.back).toHaveBeenCalled();
    expect(screen.queryByText("Сохранить изменения?")).toBeNull();
  });

  test("renames the map", async () => {
    await renderEditor();

    await fireEvent.press(screen.getByTestId("editor-name"));
    await fireEvent.changeText(screen.getByTestId("rename-field"), "Форт");
    await fireEvent.press(
      screen.getAllByText("Сохранить").at(-1) ?? screen.getByTestId("editor-name"),
    );

    expect(await screen.findByText("Форт")).toBeOnTheScreen();
  });

  test("keeps editing offline but cannot save (decision 0032 #10)", async () => {
    await renderEditor();
    await act(async () => onlineManager.setOnline(false));

    await tap(12);

    expect(screen.getByTestId("editor-save-big")).toBeDisabled();
    expect(screen.getByText("Нужен интернет")).toBeOnTheScreen();
  });

  test("explains why RANDOM does nothing offline", async () => {
    await renderEditor();
    await act(async () => onlineManager.setOnline(false));

    await choose("random");

    expect(await screen.findAllByText("Нужен интернет")).toHaveLength(2);
  });

  test("stays in the editor when saving on the way out is impossible offline", async () => {
    await renderEditor();
    await tap(12);
    await act(async () => onlineManager.setOnline(false));

    await fireEvent.press(screen.getByTestId("editor-back"));
    await fireEvent.press(
      screen.getAllByText("Сохранить").at(-1) ?? screen.getByTestId("editor-back"),
    );

    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(useEditorStore.getState().session).not.toBeNull();
  });

  test("stays in the editor when saving on the way out fails", async () => {
    await saveMap("A");
    await saveMap("B");
    await saveMap("C");
    await renderEditor();
    await tap(12);

    await fireEvent.press(screen.getByTestId("editor-back"));
    await fireEvent.press(
      screen.getAllByText("Сохранить").at(-1) ?? screen.getByTestId("editor-back"),
    );

    expect(await screen.findByText("Можно хранить до 3 карт формата")).toBeOnTheScreen();
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  test("offers a way back for a map that does not exist", async () => {
    mockParams.id = "missing";
    await render(<ArenaMapScreen />, { wrapper: createQueryWrapper() });

    await fireEvent.press(await screen.findByText("Назад"));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("lets the bot solve a valid map step by step (decision 0032 #7)", async () => {
    const id = await saveMap("Fort");
    await renderEditor(id);
    jest.useFakeTimers();

    await fireEvent.press(screen.getByTestId("editor-check-button"));
    expect(screen.getByTestId("editor-check")).toHaveTextContent(/^Бот решает… ход/);
    await act(async () => jest.advanceTimersByTime(5_000));

    expect(screen.getByTestId("editor-check")).toHaveTextContent(/^Бот нашёл 1 цели за \d+ ход/);
    jest.useRealTimers();
  });
});
