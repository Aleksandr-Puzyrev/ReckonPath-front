import { render } from "@testing-library/react-native";

import { useRulesStore } from "@entities/rules";

import HomeScreen from "./home-screen";

const mockRouter = { replace: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    mockRouter.replace.mockClear();
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
});
