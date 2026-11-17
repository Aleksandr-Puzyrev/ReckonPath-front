import { fireEvent, render, screen } from "@testing-library/react-native";

import type { DailyDay, DailyRewards } from "@entities/daily";
import { i18n } from "@shared/i18n";

import DailyTodayCard from "./daily-today-card";

const DAY: DailyDay = {
  date: "2026-09-28",
  today: true,
  title: "Штиль",
  size: [7, 8],
  players: 1240,
  nextDayAt: "2026-09-29T00:00:00Z",
};
const REWARDS: DailyRewards = { coins: 30, coinsPerStar: 10, xp: 15, topSize: 10, topGems: 10 };

const renderCard = (day: DailyDay, onPlay = jest.fn()) =>
  render(<DailyTodayCard day={day} rewards={REWARDS} onPlay={onPlay} />);

describe("DailyTodayCard", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("previews the day without a board: title, size and rewards (decision 0061 #2)", async () => {
    const onPlay = jest.fn();
    await renderCard(DAY, onPlay);

    expect(screen.getByText("Штиль")).toBeOnTheScreen();
    expect(screen.getByText("7×8")).toBeOnTheScreen();
    expect(screen.getByText("+60")).toBeOnTheScreen();
    expect(screen.getByText("+15 XP")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Играть"));
    expect(onPlay).toHaveBeenCalled();
  });

  test("continues a game of the day that is running", async () => {
    await renderCard({ ...DAY, gameId: "game-1", status: "play", attempts: 1 });

    expect(screen.getByText("Продолжить")).toBeOnTheScreen();
  });

  test("shows the won result with the place and no way to play again", async () => {
    await renderCard({
      ...DAY,
      status: "won",
      mine: { rank: 4, stars: 3, moves: 7, attempts: 2 },
    });

    expect(screen.getByText("Сыграно: 7 ходов")).toBeOnTheScreen();
    expect(screen.getByText("Место 4 из 1240")).toBeOnTheScreen();
    expect(screen.queryByTestId("daily-play")).toBeNull();
  });
});
