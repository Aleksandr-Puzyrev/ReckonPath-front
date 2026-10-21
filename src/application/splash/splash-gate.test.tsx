import { act, render, screen } from "@testing-library/react-native";

import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import SplashGate from "./splash-gate";

describe("SplashGate", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => mockServer.reset());

  test("shows the brand while starting and steps aside once ready (design 1.1)", async () => {
    await render(<SplashGate />, { wrapper: createQueryWrapper() });
    expect(screen.getByTestId("splash")).toBeOnTheScreen();
    expect(screen.getByText("SIGNAL HUNT")).toBeOnTheScreen();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.queryByTestId("splash")).toBeNull();
    expect(screen.queryByTestId("splash-updating")).toBeNull();
  });
});
