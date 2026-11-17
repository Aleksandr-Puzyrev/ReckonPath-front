import { render, screen } from "@testing-library/react-native";

import { i18n } from "@shared/i18n";

import DayLeaderboard from "./day-leaderboard";

const ENTRIES = Array.from({ length: 12 }, (_, index) => ({
  rank: index + 1,
  id: `u${index + 1}`,
  name: `Player ${index + 1}`,
  stars: 3,
  moves: 3 + index,
  attempts: 1,
}));

describe("DayLeaderboard", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("shows only the top before the own win (DLY-15)", async () => {
    await render(<DayLeaderboard entries={ENTRIES} mine={null} hasWon={false} />);

    expect(screen.getByText("Player 3")).toBeOnTheScreen();
    expect(screen.queryByText("Player 4")).toBeNull();
    expect(screen.getByText("Твоё место — после попытки")).toBeOnTheScreen();
  });

  test("shows the top ten and the own row after the win", async () => {
    await render(
      <DayLeaderboard
        entries={ENTRIES}
        mine={{ rank: 134, stars: 2, moves: 7, attempts: 2, me: true }}
        hasWon
      />,
    );

    expect(screen.getByText("Player 10")).toBeOnTheScreen();
    expect(screen.queryByText("Player 11")).toBeNull();
    expect(screen.getByText("Ты")).toBeOnTheScreen();
    expect(screen.queryByText("Твоё место — после попытки")).toBeNull();
  });

  test("does not repeat the own row when it is in the top", async () => {
    const entries = ENTRIES.map((entry) => (entry.rank === 2 ? { ...entry, me: true } : entry));
    await render(<DayLeaderboard entries={entries} mine={entries[1] ?? null} hasWon />);

    expect(screen.getAllByText("Ты")).toHaveLength(1);
  });
});
