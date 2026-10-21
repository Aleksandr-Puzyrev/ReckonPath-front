import { fireEvent, render, screen } from "@testing-library/react-native";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";
import { State } from "react-native-gesture-handler";

import Slider from "./slider";

const WIDTH = 200;

const renderSlider = async (value: number, onChange = jest.fn()) => {
  await render(
    <Slider testID="volume" label="Звуки" value={value} max={100} step={5} onChange={onChange} />,
  );
  await fireEvent(screen.getByTestId("volume"), "layout", {
    nativeEvent: { layout: { width: WIDTH } },
  });
  return onChange;
};

describe("Slider", () => {
  test("shows the level in percent and as an adjustable value", async () => {
    await renderSlider(80);

    expect(screen.getByText("80%")).toBeOnTheScreen();
    expect(screen.getByRole("adjustable")).toHaveAccessibilityValue({ min: 0, max: 100, now: 80 });
  });

  test("steps by 5 with the screen reader and stays within 0–100", async () => {
    const onChange = await renderSlider(100);

    await fireEvent(screen.getByTestId("volume"), "accessibilityAction", {
      nativeEvent: { actionName: "increment" },
    });
    await fireEvent(screen.getByTestId("volume"), "accessibilityAction", {
      nativeEvent: { actionName: "decrement" },
    });

    expect(onChange).toHaveBeenNthCalledWith(1, 100);
    expect(onChange).toHaveBeenNthCalledWith(2, 95);
  });

  test("snaps a drag to the step and clamps it to the track", async () => {
    const onChange = await renderSlider(50);

    fireGestureHandler(getByGestureTestId("volume-pan"), [
      { state: State.BEGAN, x: 61 },
      { state: State.ACTIVE, x: 61 },
      { state: State.ACTIVE, x: 300 },
    ]);

    expect(onChange).toHaveBeenNthCalledWith(1, 30);
    expect(onChange).toHaveBeenNthCalledWith(2, 100);
  });
});
