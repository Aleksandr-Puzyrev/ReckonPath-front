import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import type { DailyGameResult } from "@entities/daily";
import { i18n } from "@shared/i18n";

import DailyResultSheet from "./daily-result-sheet";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const RESULT: DailyGameResult = {
  stars: 3,
  moves: 8,
  coins: 60,
  xp: 15,
  streak: 7,
  streakGems: 15,
};

const renderSheet = (overrides: Partial<Parameters<typeof DailyResultSheet>[0]> = {}) =>
  render(
    <DailyResultSheet
      isOpen
      result={RESULT}
      limit={14}
      place={{ rank: 4, total: 1240 }}
      onHome={jest.fn()}
      {...overrides}
    />,
  );

describe("DailyResultSheet", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("shows the moves and the place among the players who won (decision 0061 #6)", async () => {
    await renderSheet();

    expect(screen.getByText("8 / 14")).toBeOnTheScreen();
    expect(screen.getByText("Место 4 из 1240")).toBeOnTheScreen();
  });

  test("shows the server's coins, XP and the reached streak milestone", async () => {
    await renderSheet();

    expect(screen.getByText("+60")).toBeOnTheScreen();
    expect(screen.getByText("+15")).toBeOnTheScreen();
    expect(screen.getByText("+15 XP")).toBeOnTheScreen();
    expect(screen.getByText("Серия 7 дней · +1")).toBeOnTheScreen();
  });

  test("waits for the place while the day is being counted", async () => {
    await renderSheet({ place: null });

    expect(screen.getByText("Считаем…")).toBeOnTheScreen();
  });

  test("offers no replay after a win (decision 0061 #3)", async () => {
    await renderSheet();

    expect(screen.getByText("На главную")).toBeOnTheScreen();
    expect(screen.queryByText(/Ещё раз/)).toBeNull();
  });
});
