import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";
import { Share } from "react-native";

import { useAccountStore } from "@entities/session";
import {
  customLevelRequestOf,
  emptyDraft,
  isDraftDirty,
  useLevelEditorStore,
  useTryoutBestStore,
} from "@entities/custom-level";
import type { CustomDraft } from "@entities/custom-level";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import LevelEditorScreen from "./level-editor-screen";

const mockRouter = { back: jest.fn(), push: jest.fn(), setParams: jest.fn() };
const mockParams = { id: "new" };
const VALID_DRAFT: CustomDraft = {
  ...emptyDraft("Бухта", 5, 5, "distance"),
  map: { rows: 5, cols: 5, targets: [[4, 4]] },
};

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

const renderScreen = async () => {
  await render(<LevelEditorScreen />, { wrapper: createQueryWrapper() });
  await fireEvent(await screen.findByTestId("editor-board-area"), "layout", {
    nativeEvent: { layout: { width: 320 } },
  });
};

const renderEditor = async () => {
  useLevelEditorStore.getState().open("new", emptyDraft("Уровень 1", 5, 5, "distance"), null);
  await renderScreen();
};

// The route params follow router.setParams, as in the app (параметры маршрута следуют router.setParams, как в приложении).
const followRouteParams = () =>
  mockRouter.setParams.mockImplementation((params: { id: string }) => {
    mockParams.id = params.id;
  });

const saveOnServer = async () => {
  const { data } = await apiClient.POST("/levels/custom", {
    body: customLevelRequestOf(VALID_DRAFT, 6),
  });
  return data?.id ?? "";
};

const tap = (cell: number) => fireEvent.press(screen.getByTestId(`cell-${cell}`));
const choose = (tool: string) => fireEvent.press(screen.getByTestId(`tool-${tool}`));

describe("LevelEditorScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => Object.values(mockRouter).forEach((mock) => mock.mockClear()));

  afterEach(async () => {
    useAccountStore.getState().reset();
    await cleanup();
    useLevelEditorStore.getState().reset();
    mockServer.reset();
    mockParams.id = "new";
    mockRouter.setParams.mockReset();
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
    useAccountStore.getState().markSignedIn();
    await renderEditor();
    await tap(24);
    await fireEvent.changeText(screen.getByTestId("editor-title"), "Бухта");

    await fireEvent.press(screen.getByTestId("editor-save"));

    expect(await screen.findByText("Уровень сохранён")).toBeOnTheScreen();
    expect(mockRouter.setParams).toHaveBeenCalledWith({ id: "level-1" });
    const { data } = await apiClient.GET("/levels/custom");
    expect(data?.levels).toMatchObject([{ title: "Бухта", level: { targets: [[4, 4]] } }]);
  });

  test("saves without offering an account (decision 0063 #6)", async () => {
    await renderEditor();
    await tap(24);

    await fireEvent.press(screen.getByTestId("editor-save"));

    expect(await screen.findByText("Уровень сохранён")).toBeOnTheScreen();
    expect(screen.queryByTestId("link-sign-in")).toBeNull();
  });

  test("replaces a saved level on the server", async () => {
    mockParams.id = await saveOnServer();
    await renderScreen();
    await fireEvent.changeText(screen.getByTestId("editor-title"), "Риф");

    await fireEvent.press(screen.getByTestId("editor-save"));

    expect(await screen.findByText("Уровень сохранён")).toBeOnTheScreen();
    const { data } = await apiClient.GET("/levels/custom");
    expect(data?.levels).toMatchObject([{ id: mockParams.id, title: "Риф" }]);
  });

  test("tells about the level limit instead of saving (decision 0063 #7)", async () => {
    for (let index = 0; index < 20; index += 1) await saveOnServer();
    await renderEditor();
    await tap(24);

    await fireEvent.press(screen.getByTestId("editor-save"));

    expect(
      await screen.findByText("Уже 20 уровней — удали один, чтобы сохранить новый"),
    ).toBeOnTheScreen();
  });

  test("shows the server's problem in the status line until the level changes (decision 0063 #10)", async () => {
    mockServer.use(
      http.post(mockUrl("/levels/custom"), () =>
        HttpResponse.json(
          {
            error: {
              code: "level_invalid",
              details: { problems: [{ code: "bridge", message: "", cells: [[4, 4]] }] },
            },
          },
          { status: 422 },
        ),
      ),
    );
    await renderEditor();
    await tap(24);

    await fireEvent.press(screen.getByTestId("editor-save"));

    await waitFor(() =>
      expect(screen.getByTestId("editor-status")).toHaveTextContent("Мост ставится на ручей"),
    );
    expect(screen.getByTestId("editor-save")).toBeDisabled();
    await tap(0);
    expect(screen.getByTestId("editor-status")).toHaveTextContent(/Бот решает/);
  });

  test("saves a level deleted elsewhere as a new one (decision 0063 #8)", async () => {
    mockParams.id = await saveOnServer();
    await renderScreen();
    await apiClient.DELETE("/levels/custom/{id}", { params: { path: { id: mockParams.id } } });
    await tap(0);

    await fireEvent.press(screen.getByTestId("editor-save"));
    expect(
      await screen.findByText("Уровень удалён на другом устройстве — сохрани его как новый"),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("editor-save"));

    expect(await screen.findByText("Уровень сохранён")).toBeOnTheScreen();
    expect(mockRouter.setParams).toHaveBeenLastCalledWith({ id: "level-2" });
  });

  test("moves to the new level without asking the server for it again", async () => {
    const getOne = jest.fn();
    mockServer.use(
      http.get(mockUrl("/levels/custom/:id"), () => {
        getOne();
        return HttpResponse.json({ error: { code: "level_not_found" } }, { status: 404 });
      }),
    );
    followRouteParams();
    await renderEditor();
    await tap(24);

    await fireEvent.press(screen.getByTestId("editor-save"));
    await screen.findByText("Уровень сохранён");
    await screen.rerender(<LevelEditorScreen />);

    expect(mockParams.id).toBe("level-1");
    expect(screen.getByTestId("editor-share")).toBeEnabled();
    expect(getOne).not.toHaveBeenCalled();
  });

  test("goes on as a new level on its route after a 404 save", async () => {
    mockParams.id = await saveOnServer();
    followRouteParams();
    await renderScreen();
    await apiClient.DELETE("/levels/custom/{id}", { params: { path: { id: mockParams.id } } });
    await tap(0);

    await fireEvent.press(screen.getByTestId("editor-save"));
    await screen.findByText("Уровень удалён на другом устройстве — сохрани его как новый");
    await screen.rerender(<LevelEditorScreen />);

    expect(mockParams.id).toBe("new");
    expect(screen.getByTestId("editor-save")).toBeEnabled();
  });

  test("keeps changes made while saving unsaved (regression)", async () => {
    mockParams.id = await saveOnServer();
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    mockServer.use(
      http.put(mockUrl("/levels/custom/:id"), async ({ params }) => {
        await gate;
        const { level } = customLevelRequestOf(VALID_DRAFT, 6);
        return HttpResponse.json({
          id: params.id,
          title: "Риф",
          level,
          updatedAt: "2026-11-22T10:00:00Z",
        });
      }),
    );
    await renderScreen();
    await fireEvent.changeText(screen.getByTestId("editor-title"), "Риф");

    await fireEvent.press(screen.getByTestId("editor-save"));
    await fireEvent.changeText(screen.getByTestId("editor-title"), "Риф 2");
    release();

    await screen.findByText("Уровень сохранён");
    const session = useLevelEditorStore.getState().session;
    expect(session?.saved?.title).toBe("Риф");
    expect(session === null ? false : isDraftDirty(session)).toBe(true);
  });

  test("checks a restored draft missing from the list (decision 0063 #11)", async () => {
    mockParams.id = "level-5";
    useLevelEditorStore.getState().open("level-5", VALID_DRAFT, VALID_DRAFT);

    await renderScreen();

    expect(
      await screen.findByText("Уровень удалён на другом устройстве — сохрани его как новый"),
    ).toBeOnTheScreen();
    expect(useLevelEditorStore.getState().session).toMatchObject({ levelId: "new", saved: null });
    expect(screen.getByTestId("editor-share")).toBeDisabled();
  });

  test("counts the elements against the backend caps (decision 0063 #3)", async () => {
    await renderEditor();

    await tap(24);

    expect(screen.getByTestId("tool-target")).toHaveTextContent(/1\/5$/);
    expect(screen.getByTestId("tool-stream")).toHaveTextContent(/0\/12$/);
    expect(screen.getByTestId("tool-buoy")).toHaveTextContent(/0\/2$/);
  });

  test("keeps the saved draft while the route still says «new» (regression)", async () => {
    useAccountStore.getState().markSignedIn();
    await renderEditor();
    await tap(24);

    await fireEvent.press(screen.getByTestId("editor-save"));
    await screen.findByText("Уровень сохранён");

    expect(useLevelEditorStore.getState().session).toMatchObject({
      levelId: "level-1",
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
    useAccountStore.getState().markSignedIn();
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
    useAccountStore.getState().markSignedIn();
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
