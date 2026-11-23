import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { customLevelRequestOf, emptyDraft, useLevelEditorStore } from "@entities/custom-level";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import MyLevelsScreen from "./my-levels-screen";

const mockRouter = { back: jest.fn(), push: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardPreview: () => null }));

const saveLevel = async (title: string) => {
  const draft = {
    ...emptyDraft(title, 5, 5, "distance"),
    map: { rows: 5, cols: 5, targets: [[2, 2]] as [number, number][] },
  };
  await apiClient.POST("/levels/custom", { body: customLevelRequestOf(draft, 6) });
};

const renderScreen = async () => {
  await render(<MyLevelsScreen />, { wrapper: createQueryWrapper() });
};

describe("MyLevelsScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => Object.values(mockRouter).forEach((mock) => mock.mockClear()));

  afterEach(async () => {
    await cleanup();
    useLevelEditorStore.getState().reset();
    mockServer.reset();
  });

  test("invites to build the first level (decision 0043 #6)", async () => {
    await renderScreen();

    expect(
      await screen.findByText("Пока ни одного уровня. Собери свой — и сыграй сам."),
    ).toBeOnTheScreen();
  });

  test("lists saved levels with their size and the server's limit", async () => {
    await saveLevel("Бухта");
    await renderScreen();

    expect(await screen.findByText("Бухта")).toBeOnTheScreen();
    expect(screen.getByText(/^5×5 · /)).toBeOnTheScreen();
    expect(screen.getByText("Удалить — кнопкой в строке. До 20 уровней.")).toBeOnTheScreen();
  });

  test("names a level without a title (decision 0063 #9)", async () => {
    await saveLevel("  ");
    await renderScreen();

    expect(await screen.findByText("Без названия")).toBeOnTheScreen();
  });

  test("tells about the limit instead of opening a new level (decision 0063 #7)", async () => {
    for (let index = 0; index < 20; index += 1) await saveLevel("Бухта");
    await renderScreen();
    await screen.findAllByText("Бухта");

    await fireEvent.press(screen.getByTestId("my-levels-new"));

    expect(
      await screen.findByText("Уже 20 уровней — удали один, чтобы сохранить новый"),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId("new-create")).toBeNull();
  });

  test("creates a level of the chosen size and mode (design 27.4)", async () => {
    await renderScreen();

    await fireEvent.press(screen.getByTestId("my-levels-new"));
    await fireEvent.press(screen.getByTestId("new-rows-plus"));
    await fireEvent.press(screen.getByTestId("new-mode-hotcold"));
    await fireEvent.press(screen.getByTestId("new-create"));

    expect(useLevelEditorStore.getState().session?.draft).toMatchObject({
      title: "Уровень 1",
      map: { rows: 7, cols: 6 },
      params: { probeMode: "hotcold" },
    });
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/editor/[id]",
      params: { id: "new" },
    });
  });

  test("deletes a level after the note that its codes keep working (decision 0063 #5)", async () => {
    await saveLevel("Бухта");
    await renderScreen();

    await fireEvent.press(await screen.findByTestId("level-delete-level-1"));
    expect(
      screen.getByText(
        "Уровень пропадёт из «Моих уровней». Коды, которые ты уже отправил, продолжат работать.",
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(
      screen.getAllByText("Удалить").at(-1) ?? screen.getByTestId("my-levels-new"),
    );

    await waitFor(() => expect(screen.queryByText("Бухта")).toBeNull());
  });

  test("takes a level deleted elsewhere as deleted (decision 0063 #8)", async () => {
    await saveLevel("Бухта");
    await renderScreen();
    await screen.findByText("Бухта");
    await apiClient.DELETE("/levels/custom/{id}", { params: { path: { id: "level-1" } } });

    await fireEvent.press(screen.getByTestId("level-delete-level-1"));
    await fireEvent.press(
      screen.getAllByText("Удалить").at(-1) ?? screen.getByTestId("my-levels-new"),
    );

    await waitFor(() => expect(screen.queryByText("Бухта")).toBeNull());
    expect(screen.queryByText("Уровень не найден")).toBeNull();
  });

  test("opens a saved level in the editor", async () => {
    await saveLevel("Бухта");
    await renderScreen();

    await fireEvent.press(await screen.findByTestId("level-row-level-1"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/editor/[id]",
      params: { id: "level-1" },
    });
  });
});
