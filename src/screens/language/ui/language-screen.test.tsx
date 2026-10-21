import { cleanup, fireEvent, render, screen } from "@testing-library/react-native";

import { useSettingsStore } from "@entities/settings";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import LanguageScreen from "./language-screen";

const mockRouter = { replace: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));

const renderScreen = async () => {
  await render(<LanguageScreen />, { wrapper: createQueryWrapper() });
};

describe("LanguageScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    mockRouter.replace.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    useSettingsStore.getState().reset();
    mockServer.reset();
  });

  test("relabels the screen at once when a language is picked (design 29.1)", async () => {
    await renderScreen();
    expect(screen.getByText("CONTINUE")).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId("language-ru"));

    expect(await screen.findByText("ПРОДОЛЖИТЬ")).toBeOnTheScreen();
    expect(screen.getByTestId("language-ru")).toBeSelected();
    expect(useSettingsStore.getState().language).toBe("ru");
  });

  test("saves the shown language and opens the level 1 tutorial (decision 0042 #4)", async () => {
    await renderScreen();

    await fireEvent.press(screen.getByTestId("language-continue"));

    expect(useSettingsStore.getState().language).toBe("en");
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "c-1" },
    });
  });
});
