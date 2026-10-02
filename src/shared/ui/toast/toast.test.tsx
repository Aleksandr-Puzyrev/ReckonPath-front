import { act, render, screen } from "@testing-library/react-native";

import Toast from "./toast";

describe("Toast", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("shows the message and asks to hide it after 1.5 s", async () => {
    const onHide = jest.fn();
    await render(<Toast message={{ id: 1, text: "Сначала пройди уровень 2" }} onHide={onHide} />);
    expect(screen.getByText("Сначала пройди уровень 2")).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(1499));
    expect(onHide).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(1));
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  test("renders nothing without a message", async () => {
    await render(<Toast message={null} onHide={jest.fn()} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
