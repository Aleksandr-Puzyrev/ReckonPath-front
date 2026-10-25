import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Share } from "react-native";

import { emptyDraft, useLevelEditorStore, useTryoutBestStore } from "@entities/custom-level";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import LevelEditorScreen from "./level-editor-screen";

const mockRouter = { back: jest.fn(), push: jest.fn(), setParams: jest.fn() };
const mockParams = { id: "new" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
}));
const mockClipboard = { setStringAsync: jest.fn(async (_text: string) => true) };
jest.mock("expo-clipboard", () => ({
  setStringAsync: (text: string) => mockClipboard.setStringAsync(text),
}));
jest.mock("expo-linking", () => ({
  createURL: (path: string, { queryParams }: { queryParams: { c: string } }) =>
    `reckonpath://${path}?c=${queryParams.c}`,
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
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

const renderEditor = async () => {
  useLevelEditorStore.getState().open("new", emptyDraft("Уровень 1", 5, 5, "distance"), null);
  await render(<LevelEditorScreen />, { wrapper: createQueryWrapper() });
  await fireEvent(screen.getByTestId("editor-board-area"), "layout", {
    nativeEvent: { layout: { width: 320 } },
  });
};

const tap = (cell: number) => fireEvent.press(screen.getByTestId(`cell-${cell}`));
const choose = (tool: string) => fireEvent.press(screen.getByTestId(`tool-${tool}`));

describe("LevelEditorScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => Object.values(mockRouter).forEach((mock) => mock.mockClear()));

  afterEach(async () => {
    await cleanup();
    useLevelEditorStore.getState().reset();
    mockServer.reset();
  });

  test("asks for a target and keeps saving and the tryout off until the level is valid", async () => {
    await renderEditor();

    expect(screen.getByTestId("editor-status")).toHaveTextContent("Нужно 1 цели");
    expect(screen.getByTestId("editor-save")).toBeDisabled();
    expect(screen.getByTestId("editor-tryout")).toBeDisabled();
  });

  test("gives the bot estimate and the + 50 % limit once a target is placed (Part 1 §7.4)", async () => {
    await renderEditor();

    await tap(24);

    expect(screen.getByTestId("editor-status")).toHaveTextContent(/Бот решает за ~\d+ ход/);
    expect(screen.getByText(/^бот решает за ~\d+$/)).toBeOnTheScreen();
    expect(screen.getByTestId("editor-tryout")).toBeEnabled();
  });

  test("warns when the limit is below the bot estimate (decision 0043 #4)", async () => {
    await renderEditor();
    await tap(24);

    useLevelEditorStore.getState().setParams({ moveLimit: 1 });

    expect(
      await screen.findByText("Меньше, чем нужно боту — уровень может не решиться"),
    ).toBeOnTheScreen();
  });

  test("places beacons and buoys (decision 0043 #2)", async () => {
    await renderEditor();

    await choose("beacon");
    await tap(0);
    await choose("buoy");
    await tap(1);

    expect(useLevelEditorStore.getState().session?.draft.map).toMatchObject({
      beacons: [[0, 0]],
      buoys: [[0, 1]],
    });
  });

  test("saves the level and shows it in «Мои уровни»", async () => {
    await renderEditor();
    await tap(24);
    await fireEvent.changeText(screen.getByTestId("editor-title"), "Бухта");

    await fireEvent.press(screen.getByTestId("editor-save"));

    expect(await screen.findByText("Уровень сохранён")).toBeOnTheScreen();
    expect(mockRouter.setParams).toHaveBeenCalledWith({ id: "custom-1" });
    const { data } = await apiClient.GET("/levels/custom");
    expect(data?.items).toMatchObject([{ level: { title: { ru: "Бухта" } } }]);
  });

  test("keeps the saved draft while the route still says «new» (regression)", async () => {
    await renderEditor();
    await tap(24);

    await fireEvent.press(screen.getByTestId("editor-save"));
    await screen.findByText("Уровень сохранён");

    expect(useLevelEditorStore.getState().session).toMatchObject({
      levelId: "custom-1",
      draft: { map: { targets: [[4, 4]] } },
    });
  });

  test("asks before leaving unsaved changes", async () => {
    await renderEditor();
    await tap(24);

    await fireEvent.press(screen.getByTestId("editor-back"));
    expect(screen.getByText("Сохранить изменения?")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Не сохранять"));

    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    expect(useLevelEditorStore.getState().session).toBeNull();
  });

  test("opens the tryout of a valid level", async () => {
    await renderEditor();
    await tap(24);

    await fireEvent.press(screen.getByTestId("editor-tryout"));

    expect(mockRouter.push).toHaveBeenCalledWith("/editor/tryout");
  });

  test("shares a saved level with its code, link and the author's challenge (design 27.5)", async () => {
    const draft = {
      ...emptyDraft("Бухта", 5, 5, "distance"),
      map: { rows: 5, cols: 5, targets: [[4, 4]] as [number, number][] },
    };
    useLevelEditorStore.getState().open("new", draft, null);
    await render(<LevelEditorScreen />, { wrapper: createQueryWrapper() });
    await fireEvent(screen.getByTestId("editor-board-area"), "layout", {
      nativeEvent: { layout: { width: 320 } },
    });
    expect(screen.getByTestId("editor-share")).toBeDisabled();
    await fireEvent.press(screen.getByTestId("editor-save"));
    await screen.findByText("Уровень сохранён");
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });

    await fireEvent.press(screen.getByTestId("editor-share"));
    const code = screen.getByTestId("share-code").props.children as string;
    expect(code).toMatch(/^RP2-/);
    expect(screen.queryByTestId("share-challenge")).toBeNull();
    await fireEvent.press(screen.getByTestId("share-copy"));
    expect(mockClipboard.setStringAsync).toHaveBeenCalledWith(code);
    expect(await screen.findByText("Код скопирован")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("share-link"));

    expect(share).toHaveBeenCalledWith({ message: `Бухта\n${code}\nreckonpath://play?c=${code}` });
    share.mockRestore();
  });

  test("offers the challenge once the author has a result (decision 0044 #1)", async () => {
    const draft = {
      ...emptyDraft("Бухта", 5, 5, "distance"),
      map: { rows: 5, cols: 5, targets: [[4, 4]] as [number, number][] },
    };
    useLevelEditorStore.getState().open("new", draft, null);
    await render(<LevelEditorScreen />, { wrapper: createQueryWrapper() });
    await fireEvent(screen.getByTestId("editor-board-area"), "layout", {
      nativeEvent: { layout: { width: 320 } },
    });
    await fireEvent.press(screen.getByTestId("editor-save"));
    await screen.findByText("Уровень сохранён");
    await fireEvent.press(screen.getByTestId("editor-share"));
    const plain = screen.getByTestId("share-code").props.children as string;
    useTryoutBestStore.getState().record(plain, 3);

    await fireEvent(await screen.findByTestId("share-challenge"), "valueChange", true);

    expect(screen.getByText("Добавить вызов · мой результат: 3 хода")).toBeOnTheScreen();
    expect(screen.getByTestId("share-code").props.children).not.toBe(plain);
    useTryoutBestStore.getState().reset();
  });
});
