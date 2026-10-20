import { cleanup, fireEvent, render, screen } from "@testing-library/react-native";

import { recordMockMatch } from "@shared/api/mocks/mock-arena-profile";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import MatchDetailsScreen from "./match-details-screen";

const mockRouter = { back: jest.fn() };
const mockParams = { id: "m1" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock("@widgets/board", () => ({
  BoardMapPreview: ({ testID }: { testID?: string }) => {
    const { View } = jest.requireActual("react-native");
    return <View testID={testID} />;
  },
}));

const MAP = { rows: 5, cols: 5, targets: [[4, 4]] as [number, number][], bombs: [] };

describe("MatchDetailsScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
  });

  test("shows the result, the turns and both maps with taps (decision 0031 #7)", async () => {
    recordMockMatch({
      outcome: "loss",
      kind: "ranked",
      opponentTrophies: 0,
      details: {
        matchId: "m1",
        mode: "ranked",
        opponent: { id: "u2", nickname: "Kira", league: "BRONZE", isBot: false, label: null },
        result: "loss",
        reason: "targets",
        turns: { me: 9, opponent: 8 },
        endedAt: "2026-10-18T12:00:00Z",
        maps: { mine: MAP, opponent: MAP },
        taps: [{ turn: 1, player: "me", cell: [0, 0], outcome: "pelang", value: 8 }],
      },
    });
    await render(<MatchDetailsScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText("Матч с Kira")).toBeOnTheScreen();
    expect(screen.getByText("Поражение · 0")).toBeOnTheScreen();
    expect(screen.getByText("9 : 8")).toBeOnTheScreen();
    expect(screen.getByText("Моя карта · тапы Kira")).toBeOnTheScreen();
    expect(screen.getByTestId("details-their-map")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("details-back"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("shows only the author's map for an async match (decision 0036 #8)", async () => {
    recordMockMatch({
      outcome: "win",
      kind: "async",
      opponentTrophies: 0,
      details: {
        matchId: "m1",
        mode: "async",
        opponent: { id: "a1", nickname: "Milo", league: "BRONZE", isBot: false, label: null },
        result: "win",
        reason: "targets",
        turns: { me: 3, opponent: 4 },
        endedAt: "2026-10-18T12:00:00Z",
        maps: { mine: MAP, opponent: MAP },
        taps: [],
      },
    });
    await render(<MatchDetailsScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByTestId("details-their-map")).toBeOnTheScreen();
    expect(screen.queryByTestId("details-my-map")).toBeNull();
  });
});
