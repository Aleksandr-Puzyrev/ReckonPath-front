import { fireEvent, render, screen } from "@testing-library/react-native";

import Stepper from "./stepper";

const renderStepper = async (value: number, onChange = jest.fn()) => {
  await render(
    <Stepper
      testID="rows"
      label="Строки"
      value={value}
      min={4}
      max={9}
      decreaseLabel="Меньше"
      increaseLabel="Больше"
      onChange={onChange}
    />,
  );
  return onChange;
};

describe("Stepper", () => {
  test("steps by one inside the range", async () => {
    const onChange = await renderStepper(5);

    await fireEvent.press(screen.getByTestId("rows-plus"));
    await fireEvent.press(screen.getByTestId("rows-minus"));

    expect(onChange).toHaveBeenNthCalledWith(1, 6);
    expect(onChange).toHaveBeenNthCalledWith(2, 4);
  });

  test("stops at the bounds (design 27.4: 4–9)", async () => {
    await renderStepper(9);

    expect(screen.getByTestId("rows-plus")).toBeDisabled();
    expect(screen.getByRole("adjustable")).toHaveAccessibilityValue({ min: 4, max: 9, now: 9 });
  });
});
