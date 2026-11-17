import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl, passMockLevels } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DailyCard from "./daily-card";

const unlockDaily = () => passMockLevels(6);

const serveDaily = (day: Record<string, unknown>, streak: Record<string, unknown> = {}) =>
  mockServer.use(
    http.get(mockUrl("/daily"), () =>
      HttpResponse.json({
        day: {
          date: "2026-09-28",
          today: true,
          size: [6, 6],
          players: 1240,
          nextDayAt: "2026-09-29T00:00:00Z",
          ...day,
        },
        streak: {
          current: 0,
          best: 0,
          todayDone: false,
          restorable: false,
          restoreCost: 30,
          milestones: [],
          ...streak,
        },
        rewards: { coins: 30, coinsPerStar: 10, xp: 15, topSize: 10, topGems: 10 },
      }),
    ),
  );

const renderCard = (onOpen = jest.fn()) =>
  render(<DailyCard onOpen={onOpen} />, { wrapper: createQueryWrapper() });

describe("DailyCard", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    jest.useFakeTimers({ now: Date.UTC(2026, 8, 28, 18, 47, 20) });
  });

  afterEach(() => {
    mockServer.reset();
    useAccountStore.getState().reset();
    jest.useRealTimers();
  });

  test("stays closed before campaign level 6", async () => {
    const onOpen = jest.fn();
    await renderCard(onOpen);

    expect(screen.getByText("Откроется после уровня 6")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("daily-card"));
    expect(onOpen).not.toHaveBeenCalled();
  });

  test("invites to play today's bearing and counts down to 00:00 UTC", async () => {
    unlockDaily();
    await renderCard();

    expect(screen.getByText("Пеленг дня · 28 сентября")).toBeOnTheScreen();
    expect(await screen.findByText("Сегодня ещё не сыгран")).toBeOnTheScreen();
    expect(screen.getByText("Новый через 05:12:40")).toBeOnTheScreen();
    await act(async () => jest.advanceTimersByTime(1000));
    expect(screen.getByText("Новый через 05:12:39")).toBeOnTheScreen();
  });

  test("shows today's win and the streak from GET /daily", async () => {
    useAccountStore.getState().markSignedIn();
    unlockDaily();
    serveDaily(
      { status: "won", mine: { rank: 4, stars: 3, moves: 7, attempts: 1 } },
      { current: 5, best: 5, todayDone: true },
    );
    await renderCard();

    expect(await screen.findByText("Сыграно: 7 ходов")).toBeOnTheScreen();
    expect(screen.getByText("5")).toBeOnTheScreen();
  });

  test("keeps a lost attempt as not played: only a win counts (decision 0061 #1)", async () => {
    unlockDaily();
    serveDaily({ gameId: "daily-1", status: "lost", attempts: 1 });
    await renderCard();

    expect(await screen.findByText("Сегодня ещё не сыгран")).toBeOnTheScreen();
  });

  test("opens the daily", async () => {
    unlockDaily();
    const onOpen = jest.fn();
    await renderCard(onOpen);
    await screen.findByText("Сегодня ещё не сыгран");

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
