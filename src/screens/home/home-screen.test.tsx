import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useRulesStore } from "@entities/rules";
import { i18n } from "@shared/i18n";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import HomeScreen from "./home-screen";

const mockRouter = { replace: jest.fn(), push: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/daily-card", () => ({
  DailyCard: ({ onOpen }: { onOpen: () => void }) => {
    const { Pressable } = jest.requireActual("react-native");
    return <Pressable testID="daily-card" onPress={onOpen} />;
  },
}));

const renderHome = async () => {
  await render(<HomeScreen />, { wrapper: createQueryWrapper() });
  // The top bar shows the balance once the player's data arrives (верхняя панель показывает баланс, когда приходят данные игрока).
  await screen.findByTestId("wallet-emeralds");
};

describe("HomeScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.replace.mockClear();
    mockRouter.push.mockClear();
    useRulesStore.getState().reset();
  });

  test("opens the level 1 tutorial on the first launch (ACC-01)", async () => {
    await renderHome();
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "c-1" },
    });
  });

  test("does not open the tutorial again once it is skipped (ACC-04)", async () => {
    useRulesStore.getState().skipTutorial();
    await renderHome();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  test("opens the daily from its card", async () => {
    useRulesStore.getState().skipTutorial();
    await renderHome();

    await fireEvent.press(screen.getByTestId("daily-card"));

    expect(mockRouter.push).toHaveBeenCalledWith("/daily");
  });

  test("shows the balance and opens the ways to earn from it (LVL-26)", async () => {
    useRulesStore.getState().skipTutorial();
    await renderHome();

    expect(screen.getByLabelText("Изумруды: 2640")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("wallet-coins"));

    expect(screen.getByText("Где получить изумруды:")).toBeOnTheScreen();
  });
});
