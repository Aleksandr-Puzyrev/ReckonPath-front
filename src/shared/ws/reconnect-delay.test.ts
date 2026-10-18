import { reconnectDelay } from "./reconnect-delay";

describe("reconnectDelay", () => {
  test("doubles from 0.5 s up to 4 s (Part 8 §9.2)", () => {
    const delays = [0, 1, 2, 3, 4, 9].map((attempt) => reconnectDelay(attempt, () => 0));

    expect(delays).toEqual([500, 1000, 2000, 4000, 4000, 4000]);
  });

  test("adds a jitter of up to a fifth", () => {
    expect(reconnectDelay(1, () => 1)).toBe(1200);
  });
});
