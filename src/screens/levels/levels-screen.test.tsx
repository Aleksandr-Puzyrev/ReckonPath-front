import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { i18n } from "@shared/i18n";
import { mockServer, passMockLevels } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import LevelsScreen from "./levels-screen";

const mockRouter = { push: jest.fn() };

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
jest.mock("@reckon-path/content", () => ({
  ...jest.requireActual("@reckon-path/content"),
  ...jest.requireActual("./test-utils/test-levels"),
}));

const renderLevels = async () => {
  await render(<LevelsScreen />, { wrapper: createQueryWrapper() });
  await screen.findByTestId("level-1");
};

const playRoute = (id: string) => ({
  pathname: "/play/[mode]/[id]",
  params: { mode: "campaign", id },
});

describe("LevelsScreen", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("ru");
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockRouter.push.mockClear();
  });

  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("opens «Мои уровни» from the editor button (decision 0043 #6)", async () => {
    await renderLevels();

    await fireEvent.press(screen.getByTestId("levels-editor"));

    expect(mockRouter.push).toHaveBeenCalledWith("/editor");
  });

  test("opens «Играть по коду» (decision 0044 #7)", async () => {
    await renderLevels();

    await fireEvent.press(screen.getByTestId("levels-play-code"));

    expect(mockRouter.push).toHaveBeenCalledWith("/play");
  });

  test("opens the current level at once", async () => {
    await renderLevels();
    await fireEvent.press(screen.getByTestId("level-1"));
    expect(mockRouter.push).toHaveBeenCalledWith(playRoute("1"));
  });

  test("tells which level to beat first when a locked level is tapped (LVL-23)", async () => {
    passMockLevels(1, 2);
    await renderLevels();
    await fireEvent.press(screen.getByTestId("level-3"));
    expect(screen.getByText("Сначала пройди уровень 2")).toBeOnTheScreen();
    expect(mockRouter.push).not.toHaveBeenCalled();

    await act(async () => jest.advanceTimersByTime(1500));
    expect(screen.queryByText("Сначала пройди уровень 2")).toBeNull();
  });

  test("shows a won level's thresholds and best result from the server in its sheet", async () => {
    passMockLevels(1, 2);
    await renderLevels();
    await fireEvent.press(screen.getByTestId("level-1"));

    expect(screen.getByText("Уровень 1")).toBeOnTheScreen();
    expect(screen.getByText("Мир 1 · Тихая бухта")).toBeOnTheScreen();
    expect(await screen.findByText("Лимит — 6 ходов")).toBeOnTheScreen();
    expect(screen.getByText("3★ — до 3 ходов")).toBeOnTheScreen();
    expect(screen.getByText("2★ — до 4 ходов")).toBeOnTheScreen();
    expect(screen.getByText("Лучший — 5 ходов")).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId("sheet-play"));
    expect(mockRouter.push).toHaveBeenCalledWith(playRoute("1"));
  });

  test("shows the server's titles and descriptions and counts the stars", async () => {
    passMockLevels(1);
    await renderLevels();
    expect(screen.getByLabelText("3 / 12")).toBeOnTheScreen();
    expect(screen.getByLabelText("Уровень 1, пройден, звёзды: 3 из 3")).toBeOnTheScreen();
    expect(screen.getByLabelText("Уровень 2, текущий")).toBeOnTheScreen();
    expect(screen.getByText("2 · Тест")).toBeOnTheScreen();
    expect(screen.getByText("4×4 · 1 бомба")).toBeOnTheScreen();
    expect(screen.getByText("Уровень 3 · 4×4")).toBeOnTheScreen();
  });

  test("collapses a world that is not open yet", async () => {
    await renderLevels();
    expect(screen.getByText("Пройди мир 1, чтобы открыть")).toBeOnTheScreen();
  });

  test("marks a world finished on three stars", async () => {
    passMockLevels(3);
    await renderLevels();
    expect(screen.getByText("3★ мир")).toBeOnTheScreen();
  });
});
