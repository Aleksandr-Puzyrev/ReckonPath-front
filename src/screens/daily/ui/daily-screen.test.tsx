import { act, render, screen } from "@testing-library/react-native";
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
});
