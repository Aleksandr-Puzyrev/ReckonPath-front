import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { useDailyRecordStore } from "@entities/daily";
import { CAMPAIGN_LEVELS } from "@entities/level";
import { useProgressStore } from "@entities/progress";
import { i18n } from "@shared/i18n";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DailyCard from "./daily-card";

jest.mock("@entities/streak", () => ({
  ...jest.requireActual("@entities/streak"),
  useStreakQuery: () => ({ data: undefined }),
}));

const unlockDaily = () =>
  useProgressStore
    .getState()
    .replaceBest(
      Object.fromEntries(
        CAMPAIGN_LEVELS.slice(0, 6).map(({ level }) => [level.id, { stars: 3, moves: 5 }]),
      ),
    );

const renderCard = (onOpen = jest.fn()) =>
  render(<DailyCard onOpen={onOpen} />, { wrapper: createQueryWrapper() });

describe("DailyCard", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    jest.useFakeTimers({ now: Date.UTC(2026, 8, 28, 18, 47, 20) });
    useProgressStore.getState().reset();
    useDailyRecordStore.getState().reset();
  });

  afterEach(() => jest.useRealTimers());

  test("stays closed before campaign level 6", async () => {
    const onOpen = jest.fn();
    await renderCard(onOpen);

    expect(screen.getByText("Откроется после уровня 6")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("daily-card"));
    expect(onOpen).not.toHaveBeenCalled();
  });

  test("invites to play today's bearing and counts down to the next one", async () => {
    unlockDaily();
    await renderCard();

    expect(screen.getByText("Пеленг дня · 28 сентября")).toBeOnTheScreen();
    expect(screen.getByText("Сегодня ещё не сыгран")).toBeOnTheScreen();
    expect(screen.getByText("Новый через 05:12:40")).toBeOnTheScreen();
    await act(async () => jest.advanceTimersByTime(1000));
    expect(screen.getByText("Новый через 05:12:39")).toBeOnTheScreen();
  });

  test("shows today's result and the streak with it", async () => {
    unlockDaily();
    useDailyRecordStore.getState().recordCounted("2026-09-28", {
      attemptId: "a",
      result: "won",
      movesUsed: 7,
      stars: 3,
      durationMs: 1,
    });
    await renderCard();

    expect(screen.getByText("Сыграно: 7 ходов")).toBeOnTheScreen();
    expect(screen.getByText("1")).toBeOnTheScreen();
  });

  test("opens the daily", async () => {
    unlockDaily();
    const onOpen = jest.fn();
    await renderCard(onOpen);

    await fireEvent.press(screen.getByTestId("daily-card"));

    expect(onOpen).toHaveBeenCalled();
  });

  test("moves to the new day at UTC midnight (DLY-02)", async () => {
    unlockDaily();
    jest.setSystemTime(Date.UTC(2026, 8, 28, 23, 59, 59));
    await renderCard();
    expect(screen.getByText("Пеленг дня · 28 сентября")).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(1000));

    expect(screen.getByText("Пеленг дня · 29 сентября")).toBeOnTheScreen();
  });
});
