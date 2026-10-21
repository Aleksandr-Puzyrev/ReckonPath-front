import { fireEvent, render, screen } from "@testing-library/react-native";

import Segmented from "./segmented";

const OPTIONS = [
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
] as const;

describe("Segmented", () => {
  test("marks the chosen option and reports a new choice", async () => {
    const onChange = jest.fn();
    await render(<Segmented testID="theme" options={OPTIONS} value="dark" onChange={onChange} />);

    expect(screen.getByTestId("theme-dark")).toBeSelected();
    expect(screen.getByTestId("theme-light")).not.toBeSelected();
    await fireEvent.press(screen.getByTestId("theme-light"));

    expect(onChange).toHaveBeenCalledWith("light");
  });
});
