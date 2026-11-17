import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { campaignQueryOptions } from "@entities/level";
import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockOverview, mockServer, mockUrl, passMockLevels } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DailyScreen from "./daily-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: () => true };

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));

const HTTP_NOT_FOUND = 404;
const DAY = "2026-09-28";
const MILESTONES = [
  { days: 3, gems: 5, reached: false },
  { days: 7, gems: 15, reached: false },
];
const BROKEN_STREAK = {
  current: 0,
  best: 19,
  lastDay: "2026-09-26",
  todayDone: false,
  broken: 12,
  restorable: true,
  restoreCost: 30,
  milestones: MILESTONES,
};

const unlockDaily = () => passMockLevels(6);

const serveDay = (day: Record<string, unknown>) =>
  mockServer.use(
    http.get(mockUrl("/daily"), () =>
      HttpResponse.json({
        day: {
          date: DAY,
          today: true,
          title: "Штиль",
          size: [6, 7],
          players: 1240,
          nextDayAt: "2026-09-29T00:00:00Z",
          ...day,
        },
        streak: BROKEN_STREAK,
        rewards: { coins: 30, coinsPerStar: 10, xp: 15, topSize: 10, topGems: 10 },
      }),
    ),
  );

const serveStreak = (overrides: Record<string, unknown> = {}) =>
  mockServer.use(
    http.get(mockUrl("/streak"), () => HttpResponse.json({ ...BROKEN_STREAK, ...overrides })),
    http.post(mockUrl("/streak/restore"), () =>
      HttpResponse.json({
        ...BROKEN_STREAK,
        current: 12,
        lastDay: "2026-09-27",
        broken: undefined,
        restorable: false,
      }),
    ),
  );

const pressLast = async (text: string) => {
  const last = screen.getAllByText(text).at(-1);
  if (last === undefined) throw new Error(`No "${text}" on the screen`);
  await fireEvent.press(last);
};

const renderScreen = async () => {
  await render(<DailyScreen />, { wrapper: createQueryWrapper() });
  await act(() => jest.advanceTimersByTimeAsync(0));
  await waitFor(() => expect(screen.toJSON()).not.toBeNull());
};

describe("DailyScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    jest.useFakeTimers({ now: Date.UTC(2026, 8, 28, 12) });
    mockRouter.push.mockClear();
  });

  afterEach(() => {
    onlineManager.setOnline(true);
    useAccountStore.getState().reset();
    mockServer.reset();
    jest.useRealTimers();
  });

  test("is closed before the server opens it (decision 0060 #5)", async () => {
    await renderScreen();

    expect(await screen.findByText("Откроется после уровня 6")).toBeOnTheScreen();
  });

  test("previews the day without a board before the start (decision 0061 #2)", async () => {
    unlockDaily();
    serveDay({});
    await renderScreen();

    expect(await screen.findByText("Штиль")).toBeOnTheScreen();
    expect(screen.getByText("6×7")).toBeOnTheScreen();
    expect(screen.getByText("+60")).toBeOnTheScreen();
    expect(screen.getByText("Играть")).toBeOnTheScreen();
    expect(screen.queryByTestId("board-area")).toBeNull();
  });

  test("shows the streak with the server's milestones and the won days only", async () => {
    useAccountStore.getState().markSignedIn();
    unlockDaily();
    serveStreak({ current: 4, best: 9, broken: undefined, restorable: false });
    mockServer.use(
      http.get(mockUrl("/daily/history"), () =>
        HttpResponse.json({ days: [{ date: "2026-09-27", stars: 3, moves: 6, attempts: 1 }] }),
      ),
    );
    await renderScreen();

    expect(await screen.findByLabelText("4 дня подряд")).toBeOnTheScreen();
    expect(screen.getByText("лучшая серия 9")).toBeOnTheScreen();
    expect(screen.getByText("15")).toBeOnTheScreen();
    expect(await screen.findByLabelText("27 сентября, победа")).toBeOnTheScreen();
  });

  test("shows the won day's result with the place and no way to play (decision 0061 #3, #6)", async () => {
    unlockDaily();
    serveDay({ status: "won", mine: { rank: 4, stars: 3, moves: 7, attempts: 2 } });
    await renderScreen();

    expect(await screen.findByText("Место 4 из 1240")).toBeOnTheScreen();
    expect(screen.getByText("Сыграно: 7 ходов")).toBeOnTheScreen();
    expect(screen.queryByTestId("daily-play")).toBeNull();
  });

  test("tells that today's level is not ready yet", async () => {
    unlockDaily();
    mockServer.use(
      http.get(mockUrl("/daily"), () =>
        HttpResponse.json({ error: { code: "daily_unavailable" } }, { status: HTTP_NOT_FOUND }),
      ),
    );
    await renderScreen();

    expect(await screen.findByText("Уровень дня ещё не готов — загляни позже")).toBeOnTheScreen();
    expect(screen.queryByText("Играть")).toBeNull();
  });

  test("needs the network to show the daily", async () => {
    unlockDaily();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    queryClient.setQueryData(campaignQueryOptions().queryKey, mockOverview("ru"));
    onlineManager.setOnline(false);
    await render(<DailyScreen />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });
    await act(() => jest.advanceTimersByTimeAsync(0));

    expect(screen.getByText("Нужна сеть, чтобы играть пеленг дня")).toBeOnTheScreen();
    await act(async () => onlineManager.setOnline(true));
    expect(await screen.findByText("Играть")).toBeOnTheScreen();
  });

  test("offers a retry when the daily cannot be loaded", async () => {
    unlockDaily();
    mockServer.use(http.get(mockUrl("/daily"), () => HttpResponse.error()));
    await renderScreen();

    expect(await screen.findByText("Нужна сеть, чтобы играть пеленг дня")).toBeOnTheScreen();
    mockServer.reset();
    unlockDaily();
    await fireEvent.press(screen.getByText("Повторить"));
    expect(await screen.findByText("Играть")).toBeOnTheScreen();
  });

  test("moves to the new day at 00:00 UTC: yesterday's win gives way to today's start", async () => {
    jest.setSystemTime(Date.UTC(2026, 8, 28, 23, 59, 59));
    unlockDaily();
    mockServer.use(
      http.get(mockUrl("/daily"), () => {
        const date = new Date(Date.now()).toISOString().slice(0, 10);
        return HttpResponse.json({
          day: {
            date,
            today: true,
            size: [6, 7],
            players: 1240,
            nextDayAt: "2026-09-30T00:00:00Z",
            ...(date === DAY
              ? { status: "won", mine: { rank: 4, stars: 3, moves: 7, attempts: 1 } }
              : {}),
          },
          streak: { ...BROKEN_STREAK, broken: undefined, restorable: false, current: 1 },
          rewards: { coins: 30, coinsPerStar: 10, xp: 15, topSize: 10, topGems: 10 },
        });
      }),
    );
    await renderScreen();
    expect(await screen.findByText("Место 4 из 1240")).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTimeAsync(1000));

    expect(await screen.findByTestId("daily-play")).toBeOnTheScreen();
    expect(screen.queryByText("Место 4 из 1240")).toBeNull();
    await fireEvent.press(screen.getByTestId("daily-play"));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "daily", id: "d-2026-09-29" },
    });
  });

  test("starts today's game at once when nothing can be restored", async () => {
    unlockDaily();
    serveDay({});
    serveStreak({ broken: undefined, restorable: false, current: 3 });
    await renderScreen();

    await fireEvent.press(await screen.findByText("Играть"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "daily", id: `d-${DAY}` },
    });
  });

  test("restores a streak broken yesterday for emeralds (DLY-09)", async () => {
    unlockDaily();
    serveStreak();
    await renderScreen();

    expect(await screen.findByText("Серия 12 дней прервалась")).toBeOnTheScreen();
    expect(screen.getByText("Вчера пеленг не сыгран · вернуть можно ещё 12 ч")).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTimeAsync(0));
    await fireEvent.press(screen.getByTestId("restore-emeralds"));
    await act(() => jest.advanceTimersByTimeAsync(0));

    expect(screen.getByText("Серия восстановлена")).toBeOnTheScreen();
  });

  test("opens the same ways to earn as the showroom when emeralds are short", async () => {
    unlockDaily();
    serveStreak();
    mockServer.use(http.get(mockUrl("/wallet"), () => HttpResponse.json({ gems: 10, coins: 0 })));
    await renderScreen();
    await screen.findByText("Серия 12 дней прервалась");
    await act(() => jest.advanceTimersByTimeAsync(0));

    await fireEvent.press(screen.getByTestId("restore-emeralds"));

    expect(screen.getByText("Не хватает")).toBeOnTheScreen();
    expect(screen.getByText("20")).toBeOnTheScreen();
  });

  test("explains the weekly limit instead of offering a restore (DLY-10)", async () => {
    unlockDaily();
    serveStreak({ restorable: false, restoreAt: "2026-10-01T10:00:00Z" });
    await renderScreen();

    expect(await screen.findByText("Восстановление — раз в неделю")).toBeOnTheScreen();
    expect(screen.queryByTestId("restore-emeralds")).toBeNull();
  });

  test("warns to restore the streak before the start (decision 0061 #9)", async () => {
    unlockDaily();
    serveDay({});
    serveStreak();
    await renderScreen();
    await screen.findByText("Серия 12 дней прервалась");

    await fireEvent.press(screen.getByTestId("daily-play"));

    expect(
      screen.getByText("Сначала восстанови серию — после победы она начнётся заново"),
    ).toBeOnTheScreen();
    expect(mockRouter.push).not.toHaveBeenCalled();
    await pressLast("Играть");
    expect(mockRouter.push).toHaveBeenCalled();
  });

  test("restores from the warning instead of starting", async () => {
    unlockDaily();
    serveDay({});
    serveStreak();
    await renderScreen();
    await screen.findByText("Серия 12 дней прервалась");
    await act(() => jest.advanceTimersByTimeAsync(0));

    await fireEvent.press(screen.getByTestId("daily-play"));
    await pressLast("Восстановить серию");
    await act(() => jest.advanceTimersByTimeAsync(0));

    expect(screen.getByText("Серия восстановлена")).toBeOnTheScreen();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
