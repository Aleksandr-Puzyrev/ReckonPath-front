import { fireEvent, render, screen } from "@testing-library/react-native";

import { useRulesStore } from "@entities/rules";

import HomeScreen from "./home-screen";

const mockRouter = { replace: jest.fn(), push: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@widgets/daily-card", () => ({
  DailyCard: ({ onOpen }: { onOpen: () => void }) => {
    const { Pressable } = jest.requireActual("react-native");
    return <Pressable testID="daily-card" onPress={onOpen} />;
  },
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    mockRouter.replace.mockClear();
    mockRouter.push.mockClear();
    useRulesStore.getState().reset();
  });

  test("opens the level 1 tutorial on the first launch (ACC-01)", async () => {
    await render(<HomeScreen />);
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "c-1" },
    });
  });

  test("does not open the tutorial again once it is skipped (ACC-04)", async () => {
    useRulesStore.getState().skipTutorial();
    await render(<HomeScreen />);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  test("opens the daily from its card", async () => {
    useRulesStore.getState().skipTutorial();
    await render(<HomeScreen />);

    await fireEvent.press(screen.getByTestId("daily-card"));

    expect(mockRouter.push).toHaveBeenCalledWith("/daily");
  });
});
