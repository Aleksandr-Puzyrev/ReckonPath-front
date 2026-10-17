import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useDailyRecordStore } from "@entities/daily";
import { CAMPAIGN_LEVELS } from "@entities/level";
import { useProgressStore } from "@entities/progress";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
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
jest.mock("@widgets/board", () => ({ BoardPreview: () => null }));

const unlockDaily = () =>
  useProgressStore
    .getState()
    .replaceBest(
      Object.fromEntries(
        CAMPAIGN_LEVELS.slice(0, 6).map(({ level }) => [level.id, { stars: 3, moves: 5 }]),
      ),
    );

const serveStreak = (overrides: Record<string, unknown>) =>
  mockServer.use(
    http.get(mockUrl("/streak"), () =>
      HttpResponse.json({ current: 12, best: 19, lastDay: "2026-09-26", ...overrides }),
    ),
  );

const renderScreen = async (wrapper: ({ children }: { children: ReactNode }) => ReactNode) => {
  await render(<DailyScreen />, { wrapper });
  await act(() => jest.advanceTimersByTimeAsync(0));
};

describe("DailyScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    jest.useFakeTimers({ now: Date.UTC(2026, 8, 28, 12) });
    useProgressStore.getState().reset();
    useDailyRecordStore.getState().reset();
  });

  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("is closed before campaign level 6", async () => {
    await renderScreen(createQueryWrapper());

    expect(screen.getByText("Откроется после уровня 6")).toBeOnTheScreen();
  });

  test("shows the day, the streak, the calendar and the day's top", async () => {
    unlockDaily();
    await renderScreen(createQueryWrapper());

    expect(screen.getByText("28 сентября · понедельник")).toBeOnTheScreen();
    expect(screen.getByText("Пеленг дня")).toBeOnTheScreen();
    expect(screen.getByText("Последние 30 дней")).toBeOnTheScreen();
    expect(await screen.findByText("Nova")).toBeOnTheScreen();
    expect(screen.getByText("В среднем 9 ходов")).toBeOnTheScreen();
  });

  test("keeps the daily playable offline with a note instead of the standings", async () => {
    unlockDaily();
    mockServer.use(http.get(mockUrl("/daily/:date"), () => HttpResponse.error()));
    await renderScreen(createQueryWrapper());

    expect(await screen.findByText("Результат отправится, когда появится сеть")).toBeOnTheScreen();
    expect(screen.getByText("Играть")).toBeOnTheScreen();
  });

  test("restores a streak broken yesterday for emeralds (DLY-09)", async () => {
    unlockDaily();
    serveStreak({ restorable: true, price: 30, restoreUntil: "2026-09-29T00:00:00Z" });
    await renderScreen(createQueryWrapper());

    expect(await screen.findByText("Серия 12 дней прервалась")).toBeOnTheScreen();
    expect(screen.getByText("Вчера пеленг не сыгран · вернуть можно ещё 12 ч")).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTimeAsync(0));
    await fireEvent.press(screen.getByTestId("restore-emeralds"));
    await act(() => jest.advanceTimersByTimeAsync(0));

    expect(screen.getByText("Серия восстановлена")).toBeOnTheScreen();
  });

  test("restores a streak broken yesterday for an ad (DLY-09)", async () => {
    unlockDaily();
    serveStreak({ restorable: true, price: 30, restoreUntil: "2026-09-29T00:00:00Z" });
    await renderScreen(createQueryWrapper());
    await screen.findByText("Серия 12 дней прервалась");

    await fireEvent.press(screen.getByTestId("restore-ad"));
    await act(() => jest.advanceTimersByTimeAsync(2000));

    expect(screen.getByText("Серия восстановлена")).toBeOnTheScreen();
  });

  test("hides the ad restore after today's limit (decision 0026 #16)", async () => {
    unlockDaily();
    serveStreak({ restorable: true, price: 30 });
    mockServer.use(
      http.get(mockUrl("/ads/limits"), () =>
        HttpResponse.json({
          gems: { used: 0, max: 5, resetAt: "2026-09-29T00:00:00Z" },
          continue: { used: 0, max: 2, resetAt: "2026-09-29T00:00:00Z" },
          streak: { used: 1, max: 1, resetAt: "2026-09-29T00:00:00Z" },
        }),
      ),
    );
    await renderScreen(createQueryWrapper());
    await screen.findByText("Серия 12 дней прервалась");
    await waitFor(() => expect(screen.queryByTestId("restore-ad")).toBeNull());
    expect(screen.getByTestId("restore-emeralds")).toBeOnTheScreen();
  });

  test("opens the ways to earn when emeralds are short for the restore", async () => {
    unlockDaily();
    serveStreak({ restorable: true, price: 30 });
    mockServer.use(
      http.get(mockUrl("/me"), () => HttpResponse.json({ wallet: { emeralds: 10, coins: 0 } })),
    );
    await renderScreen(createQueryWrapper());
    await screen.findByText("Серия 12 дней прервалась");
    await act(() => jest.advanceTimersByTimeAsync(0));

    await fireEvent.press(screen.getByTestId("restore-emeralds"));

    expect(screen.getByText("Не хватает")).toBeOnTheScreen();
    expect(screen.getByText("20")).toBeOnTheScreen();
  });

  test("explains the weekly limit instead of offering a restore (DLY-10)", async () => {
    unlockDaily();
    serveStreak({ restorable: false });
    await renderScreen(createQueryWrapper());

    expect(await screen.findByText("Восстановление — раз в неделю")).toBeOnTheScreen();
    expect(screen.queryByTestId("restore-emeralds")).toBeNull();
  });
});
