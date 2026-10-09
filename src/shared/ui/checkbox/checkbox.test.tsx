import { fireEvent, render, screen } from "@testing-library/react-native";

import Checkbox from "./checkbox";

describe("Checkbox", () => {
  test("announces its state and toggles on press", async () => {
    const onToggle = jest.fn();
    await render(<Checkbox label="Согласен" isChecked={false} onToggle={onToggle} />);

    const box = screen.getByRole("checkbox", { name: "Согласен" });
    expect(box).not.toBeChecked();
    await fireEvent.press(box);

    expect(onToggle).toHaveBeenCalled();
  });

  test("shows the error under the box", async () => {
    await render(
      <Checkbox label="Согласен" isChecked={false} onToggle={jest.fn()} error="Нужно согласие" />,
    );

    expect(screen.getByText("Нужно согласие")).toBeOnTheScreen();
  });
});
