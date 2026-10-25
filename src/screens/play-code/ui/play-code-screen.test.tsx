import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { encodeLevel } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { i18n } from "@shared/i18n";

import PlayCodeScreen from "./play-code-screen";

const mockRouter = { back: jest.fn(), push: jest.fn() };
const mockParams: { c?: string } = {};
const mockClipboard = { text: "" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock("expo-clipboard", () => ({ getStringAsync: async () => mockClipboard.text }));
jest.mock("@widgets/board", () => ({ BoardPreview: () => null }));

const LEVEL: LevelInput = {
  v: 2,
  id: "u-a",
  title: { ru: "Маяк на отмели", en: "Shoal beacon" },
  rows: 7,
  cols: 7,
  targets: [
    [1, 1],
    [5, 5],
  ],
  streams: [[3, 3]],
  probeMode: "distance",
  moveLimit: 20,
};

const renderScreen = async () => {
  await render(<PlayCodeScreen />);
};

const type = (code: string) => fireEvent.changeText(screen.getByTestId("play-code-input"), code);

describe("PlayCodeScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    Object.values(mockRouter).forEach((mock) => mock.mockClear());
    mockParams.c = undefined;
  });

  afterEach(cleanup);

  test("previews a level with the author's challenge and plays it (design 27.6)", async () => {
    await renderScreen();
    const code = encodeLevel(LEVEL, 8);

    await type(code);

    expect(screen.getByText("Маяк на отмели")).toBeOnTheScreen();
    expect(screen.getByText("7×7 · 2 цели")).toBeOnTheScreen();
    expect(screen.getByText("8 ходов")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("play-code-play"));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/play/code", params: { c: code } });
  });

  test.each([
    ["ABC", "Неверный код"],
    [encodeLevel({ ...LEVEL, bombs: [[1, 1]] }), "Уровень не проходит проверку"],
  ])("explains a bad code %s under the field (Part 1 §7.4)", async (code, text) => {
    await renderScreen();

    await type(code);

    expect(screen.getByText(text)).toBeOnTheScreen();
    expect(screen.queryByTestId("play-code-play")).toBeNull();
  });

  test("pastes a code from the clipboard on a tap", async () => {
    mockClipboard.text = encodeLevel(LEVEL);
    await renderScreen();

    await fireEvent.press(screen.getByTestId("play-code-paste"));

    await waitFor(() => expect(screen.getByTestId("code-preview")).toBeOnTheScreen());
  });

  test("opens the preview straight from a link (decision 0044 #5)", async () => {
    mockParams.c = encodeLevel(LEVEL);
    await renderScreen();

    expect(screen.getByTestId("code-preview")).toBeOnTheScreen();
  });
});
