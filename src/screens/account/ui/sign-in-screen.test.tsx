import { act, render, screen } from "@testing-library/react-native";

import { i18n } from "@shared/i18n";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import SignInScreen from "./sign-in-screen";

const mockParams: { email?: string; reset?: string } = {};

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), dismissTo: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

// Longer than any toast stays on the screen (дольше, чем любой тост держится на экране).
const TOAST_GONE_MS = 10_000;

const renderScreen = () => render(<SignInScreen />, { wrapper: createQueryWrapper() });

describe("SignInScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => {
    delete mockParams.email;
    delete mockParams.reset;
  });

  test("tells about the new password and fills the e-mail after the recovery (decision 0053 #9)", async () => {
    mockParams.email = "nova@mail.ru";
    mockParams.reset = "1730000000000";

    await renderScreen();

    expect(screen.getByText("Пароль изменён — войди с новым")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("nova@mail.ru")).toBeOnTheScreen();
  });

  test("shows the notice again for the next recovery", async () => {
    jest.useFakeTimers();
    mockParams.reset = "1";
    const { rerender } = await renderScreen();
    await act(async () => jest.advanceTimersByTime(TOAST_GONE_MS));
    expect(screen.queryByText("Пароль изменён — войди с новым")).toBeNull();
    mockParams.reset = "2";

    await rerender(<SignInScreen />);

    expect(screen.getByText("Пароль изменён — войди с новым")).toBeOnTheScreen();
    jest.useRealTimers();
  });

  test("shows no notice on an ordinary sign-in", async () => {
    await renderScreen();

    expect(screen.queryByText("Пароль изменён — войди с новым")).toBeNull();
  });
});
