import { render, screen } from "@testing-library/react-native";

import { i18n } from "@shared/i18n";

import DayLeaderboard from "./day-leaderboard";

const TOP = Array.from({ length: 12 }, (_, index) => ({
  rank: index + 1,
  user: { id: `u${index + 1}`, nickname: `Player ${index + 1}` },
  value: 3 + index,
}));

describe("DayLeaderboard", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("shows only the top and the median before the own attempt (DLY-15)", async () => {
    await render(<DayLeaderboard top={TOP} median={9} myPlace={null} hasPlayed={false} />);

    expect(screen.getByText("Player 3")).toBeOnTheScreen();
    expect(screen.queryByText("Player 4")).toBeNull();
    expect(screen.getByText("Твоё место — после попытки")).toBeOnTheScreen();
    expect(screen.getByText("В среднем 9 ходов")).toBeOnTheScreen();
  });

  test("shows the top ten and the own row after the attempt", async () => {
    await render(
      <DayLeaderboard top={TOP} median={9} myPlace={{ rank: 134, moves: 7 }} hasPlayed />,
    );

    expect(screen.getByText("Player 10")).toBeOnTheScreen();
    expect(screen.queryByText("Player 11")).toBeNull();
    expect(screen.getByText("Ты")).toBeOnTheScreen();
    expect(screen.queryByText("Твоё место — после попытки")).toBeNull();
  });

  test("tells the result will be sent when the standings cannot load", async () => {
    await render(<DayLeaderboard top={null} median={null} myPlace={null} hasPlayed={false} />);

    expect(screen.getByText("Результат отправится, когда появится сеть")).toBeOnTheScreen();
  });
});
