import { impactAsync } from "expo-haptics";

import { haptic, setHapticsEnabled } from "./haptic";

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

describe("haptic", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(impactAsync).mockClear();
  });
  afterEach(() => jest.useRealTimers());

  test("stays silent while vibration is off", () => {
    setHapticsEnabled(false);
    haptic("light");
    expect(impactAsync).not.toHaveBeenCalled();
  });

  test("plays once per 80 ms", () => {
    setHapticsEnabled(true);
    jest.advanceTimersByTime(100);
    haptic("light");
    haptic("light");
    expect(impactAsync).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(80);
    haptic("light");
    expect(impactAsync).toHaveBeenCalledTimes(2);
  });
});
