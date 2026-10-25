import { recordServerDate, serverClockOffset, subscribeServerClock } from "./server-clock";

const NOW = Date.parse("2026-10-25T12:00:00Z");

describe("server clock", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    recordServerDate(new Date(NOW).toUTCString());
  });

  afterEach(() => jest.useRealTimers());

  test("takes the offset from the Date header", () => {
    recordServerDate("Sun, 25 Oct 2026 12:00:30 GMT");

    expect(serverClockOffset()).toBe(30_000);
  });

  test("ignores changes below the header's one-second precision", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeServerClock(listener);
    jest.setSystemTime(NOW + 400);

    recordServerDate("Sun, 25 Oct 2026 12:00:00 GMT");

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  test("ignores a missing or broken header", () => {
    recordServerDate(null);
    recordServerDate("not a date");

    expect(serverClockOffset()).toBe(0);
  });
});
