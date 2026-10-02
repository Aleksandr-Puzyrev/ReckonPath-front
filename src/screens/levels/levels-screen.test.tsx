import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useProgressStore } from "@entities/progress";
import { i18n } from "@shared/i18n";

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
    useProgressStore.getState().reset();
  });

  afterEach(() => jest.useRealTimers());

  test("opens the current level at once", async () => {
    await render(<LevelsScreen />);
    await fireEvent.press(screen.getByTestId("level-c-a"));
    expect(mockRouter.push).toHaveBeenCalledWith(playRoute("c-a"));
  });

  test("tells which level to beat first when a locked level is tapped (LVL-23)", async () => {
    useProgressStore.getState().recordWin("c-a", { stars: 2, moves: 4 });
    await render(<LevelsScreen />);
    await fireEvent.press(screen.getByTestId("level-c-c"));
    expect(screen.getByText("Сначала пройди уровень 2")).toBeOnTheScreen();
    expect(mockRouter.push).not.toHaveBeenCalled();

    await act(async () => jest.advanceTimersByTime(1500));
    expect(screen.queryByText("Сначала пройди уровень 2")).toBeNull();
  });

  test("shows a won level's thresholds and best result in its sheet", async () => {
    useProgressStore.getState().recordWin("c-a", { stars: 2, moves: 4 });
    await render(<LevelsScreen />);
    await fireEvent.press(screen.getByTestId("level-c-a"));

    expect(screen.getByText("Уровень 1")).toBeOnTheScreen();
    expect(screen.getByText("Лимит — 6 ходов")).toBeOnTheScreen();
    expect(screen.getByText("3★ — до 3 ходов")).toBeOnTheScreen();
    expect(screen.getByText("2★ — до 4 ходов")).toBeOnTheScreen();
    expect(screen.getByText("Лучший — 4 хода")).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId("sheet-play"));
    expect(mockRouter.push).toHaveBeenCalledWith(playRoute("c-a"));
  });

  test("describes rows and counts the stars", async () => {
    useProgressStore.getState().recordWin("c-a", { stars: 3, moves: 3 });
    await render(<LevelsScreen />);
    expect(screen.getByLabelText("3 / 9")).toBeOnTheScreen();
    expect(screen.getByLabelText("Уровень 1, пройден, звёзды: 3 из 3")).toBeOnTheScreen();
    expect(screen.getByLabelText("Уровень 2, текущий")).toBeOnTheScreen();
    expect(screen.getByText("Уровень 3 · 4×4 · 1 цель")).toBeOnTheScreen();
  });

  test("collapses a world that is not open yet", async () => {
    await render(<LevelsScreen />);
    expect(screen.getByText("Пройди мир 1, чтобы открыть")).toBeOnTheScreen();
  });

  test("marks a world finished on three stars", async () => {
    ["c-a", "c-b", "c-c"].forEach((id) =>
      useProgressStore.getState().recordWin(id, { stars: 3, moves: 3 }),
    );
    await render(<LevelsScreen />);
    expect(screen.getByText("3★ мир")).toBeOnTheScreen();
  });
});
