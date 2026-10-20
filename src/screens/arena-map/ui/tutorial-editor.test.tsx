import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { useEditorStore } from "@entities/arena-map";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaMapScreen from "./arena-map-screen";

const mockRouter = { back: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => ({ id: "tutorial" }),
}));

jest.mock("@widgets/board", () => ({
  useBoardFx: () => ({ play: jest.fn() }),
  BoardEditor: ({
    onStrokeStart,
    onStrokeCell,
    onStrokeEnd,
  }: {
    onStrokeStart: () => void;
    onStrokeCell: (idx: number, index: number) => void;
    onStrokeEnd: () => void;
  }) => {
    const { Pressable, View } = jest.requireActual("react-native");
    return (
      <View>
        {Array.from({ length: 25 }, (_, cell) => (
          <Pressable
            key={cell}
            testID={`cell-${cell}`}
            onPress={() => {
              onStrokeStart();
              onStrokeCell(cell, 0);
              onStrokeEnd();
            }}
          />
        ))}
      </View>
    );
  },
}));

const ROCK = 20;
const STREAM = 12;
const PLAIN = 24;
const OTHER = 4;

const renderTutorial = async () => {
  await render(<ArenaMapScreen />, { wrapper: createQueryWrapper() });
  await screen.findByTestId("editor-status");
  await fireEvent(screen.getByTestId("editor-board-area"), "layout", {
    nativeEvent: { layout: { width: 320 } },
  });
};

const tap = (cell: number) => fireEvent.press(screen.getByTestId(`cell-${cell}`));
const choose = (tool: string) => fireEvent.press(screen.getByTestId(`tool-${tool}`));

describe("TutorialEditor", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.back.mockClear());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useEditorStore.getState().reset();
  });

  test("opens the template with only the target and the bomb (decision 0037 #7)", async () => {
    await renderTutorial();

    expect(screen.getByText("Твоя первая карта")).toBeOnTheScreen();
    expect(screen.getByText("Обучение редактору")).toBeOnTheScreen();
    expect(screen.getByTestId("editor-status")).toHaveTextContent(
      "Выбери «Цель» и тапни по клетке — поставь 1 цель",
    );
    expect(useEditorStore.getState().session?.map.rocks).toHaveLength(2);
    expect(screen.getByTestId("tool-target")).toBeOnTheScreen();
    expect(screen.getByTestId("tool-bomb")).toBeOnTheScreen();
    expect(screen.queryByTestId("tool-stream")).toBeNull();
    expect(screen.queryByTestId("editor-back")).toBeNull();
  });

  test("explains why a rock cannot hold a target", async () => {
    await renderTutorial();

    await tap(ROCK);

    expect(
      await screen.findByText("Скала непроходима — на неё нельзя ставить цель или бомбу."),
    ).toBeOnTheScreen();
  });

  test("praises a target on a stream and asks for the bomb next", async () => {
    await renderTutorial();

    await tap(STREAM);

    expect(
      await screen.findByText("Цель на ручье: последний шаг к ней стоит 3 — хитро!"),
    ).toBeOnTheScreen();
    expect(screen.getByTestId("editor-status")).toHaveTextContent(
      "Теперь выбери «Бомба» и спрячь одну",
    );
  });

  test("keeps the bomb off the target and to one bomb", async () => {
    await renderTutorial();
    await tap(STREAM);
    await choose("bomb");

    await tap(STREAM);
    expect(
      await screen.findByText("Цель и бомба не могут стоять на одной клетке."),
    ).toBeOnTheScreen();
    await tap(OTHER);
    await tap(PLAIN);

    expect(
      await screen.findByText(/^В обучении — 1 бомба\. Лимит лиги Bronze — \d+\.$/),
    ).toBeOnTheScreen();
    expect(useEditorStore.getState().session?.map.bombs).toHaveLength(1);
  });

  test("saves the map, finishes the onboarding and returns to the arena", async () => {
    await renderTutorial();
    await tap(STREAM);
    await choose("bomb");
    await tap(OTHER);
    await waitFor(() => expect(screen.getByTestId("tutorial-save")).toBeEnabled());

    await fireEvent.press(screen.getByTestId("tutorial-save"));

    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    const arena = (await apiClient.GET("/arena")).data;
    expect(arena?.onboardingDone).toBe(true);
    expect(arena?.activeMapId).not.toBeNull();
    expect(useEditorStore.getState().session).toBeNull();
  });
});
