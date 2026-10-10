import { fireEvent, render, screen } from "@testing-library/react-native";

import { i18n } from "@shared/i18n";

import AdsPreScreen from "./ads-pre-screen";

describe("AdsPreScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("explains the request and continues to it", async () => {
    const onContinue = jest.fn();
    await render(<AdsPreScreen isOpen onContinue={onContinue} onClosed={jest.fn()} />);

    expect(screen.getByText("Реклама по интересам")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("ads-pre-screen-continue"));

    expect(onContinue).toHaveBeenCalled();
  });
});
