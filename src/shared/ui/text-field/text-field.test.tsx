import { fireEvent, render, screen } from "@testing-library/react-native";

import TextField from "./text-field";

const TOGGLE = { show: "Показать", hide: "Скрыть" };

describe("TextField", () => {
  test("shows the error under the field", async () => {
    await render(<TextField label="Ник" value="" error="Уже занято" />);

    expect(screen.getByText("Уже занято")).toBeOnTheScreen();
  });

  test("hides the password until it is revealed", async () => {
    await render(<TextField testID="field" label="Пароль" value="secret" secureToggle={TOGGLE} />);
    expect(screen.getByTestId("field")).toHaveProp("secureTextEntry", true);

    await fireEvent.press(screen.getByText("Показать"));

    expect(screen.getByTestId("field")).toHaveProp("secureTextEntry", false);
    expect(screen.getByText("Скрыть")).toBeOnTheScreen();
  });

  test("reports typed text", async () => {
    const onChangeText = jest.fn();
    await render(<TextField testID="field" label="Ник" value="" onChangeText={onChangeText} />);

    await fireEvent.changeText(screen.getByTestId("field"), "Nova");

    expect(onChangeText).toHaveBeenCalledWith("Nova");
  });
});
