import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";

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

type Props = ComponentProps<typeof DayLeaderboard>;

const renderBoard = (props: Partial<Props>) =>
  render(
    <DayLeaderboard
      entries={ENTRIES}
      mine={null}
      hasWon={false}
      scope="all"
      hasFriends
      isOnline
      onScopeChange={jest.fn()}
      onAddFriends={jest.fn()}
      onOpenProfile={jest.fn()}
      {...props}
    />,
  );

describe("DayLeaderboard", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("shows only the top before the own win (DLY-15)", async () => {
    await renderBoard({});

    expect(screen.getByText("Player 3")).toBeOnTheScreen();
    expect(screen.queryByText("Player 4")).toBeNull();
    expect(screen.getByText("Твоё место — после попытки")).toBeOnTheScreen();
  });

  test("shows the top ten and the own row after the win", async () => {
    await renderBoard({
      mine: { rank: 134, stars: 2, moves: 7, attempts: 2, me: true },
      hasWon: true,
    });

    expect(screen.getByText("Player 10")).toBeOnTheScreen();
    expect(screen.queryByText("Player 11")).toBeNull();
    expect(screen.getByText("Ты")).toBeOnTheScreen();
    expect(screen.queryByText("Твоё место — после попытки")).toBeNull();
  });

  test("does not repeat the own row when it is in the top", async () => {
    const entries = ENTRIES.map((entry) => (entry.rank === 2 ? { ...entry, me: true } : entry));
    await renderBoard({ entries, mine: entries[1] ?? null, hasWon: true });

    expect(screen.getAllByText("Ты")).toHaveLength(1);
  });

  test("switches between all players and friends (decision 0062 #12)", async () => {
    const onScopeChange = jest.fn();
    await renderBoard({ onScopeChange });

    await fireEvent.press(screen.getByTestId("leaderboard-scope-friends"));

    expect(onScopeChange).toHaveBeenCalledWith("friends");
  });

  test("shows my row without a rank outside the friends list (decision 0062 #12)", async () => {
    await renderBoard({
      scope: "friends",
      entries: ENTRIES.slice(0, 2),
      mine: { stars: 2, moves: 9, attempts: 3, me: true },
      hasWon: true,
    });

    expect(screen.getByLabelText("Ты, 9 ходов")).toBeOnTheScreen();
  });

  test("opens another player's profile from his row, never from mine (decision 0066 #9)", async () => {
    const onOpenProfile = jest.fn();
    const entries = ENTRIES.map((entry) => (entry.rank === 2 ? { ...entry, me: true } : entry));
    await renderBoard({ entries, hasWon: true, onOpenProfile });

    await fireEvent.press(screen.getByLabelText("Открыть профиль Player 1"));

    expect(onOpenProfile).toHaveBeenCalledWith("u1");
    expect(screen.queryByLabelText("Открыть профиль Ты")).toBeNull();
  });

  test("offers to add friends on an empty friends tab", async () => {
    const onAddFriends = jest.fn();
    await renderBoard({ scope: "friends", hasFriends: false, entries: [], onAddFriends });

    expect(screen.getByText("Добавь друзей")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("leaderboard-add-friends"));
    expect(onAddFriends).toHaveBeenCalled();
  });
});
