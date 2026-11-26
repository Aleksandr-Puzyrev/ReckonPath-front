import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import type { EventAttempt } from "@entities/competition";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";
import { Button as MockButton } from "@shared/ui/button";

import EventAttemptScreen from "./event-attempt-screen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ code: "ABCDEF23", id: "attempt-id" }),
}));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  API_BASE_URL: "",
  HAS_BACKEND: true,
}));
jest.mock("@shared/haptics", () => ({ haptic: jest.fn() }));
jest.mock("@widgets/board", () => ({
  useBoardFx: () => ({ play: jest.fn() }),
  Board: ({ onCellPress }: { onCellPress: (cell: number) => void }) => (
    <MockButton label="Test cell" onPress={() => onCellPress(6)} />
  ),
}));

const attempt: EventAttempt = {
  id: "attempt-id",
  board: {
    rows: 4,
    cols: 5,
    terrain: [".....", ".....", ".....", "....."],
    fences: [],
    beacons: [],
    mode: "number",
    fog: 0,
    order: false,
    limit: 8,
    stars: [4, 6],
    targets: 1,
    bombs: 0,
    buoys: 0,
  },
  cells: [],
  seq: 0,
  status: "play",
  moves: 0,
  score: 0,
};
const won: EventAttempt = {
  ...attempt,
  cells: [{ row: 1, col: 1, kind: "target", epoch: 1 }],
  seq: 1,
  status: "won",
  moves: 1,
  score: 3,
};

const setupAttempt = async () => {
  await render(<EventAttemptScreen />, { wrapper: createQueryWrapper() });
  const board = await screen.findByTestId("event-board-area");
  await fireEvent(board, "layout", { nativeEvent: { layout: { width: 320, height: 400 } } });
  return screen.getByRole("button", { name: "Test cell" });
};

describe("event attempt", () => {
  beforeAll(() => i18n.changeLanguage("en"));
  afterEach(() => mockServer.reset());

  test("sends the server sequence and flat cell index and draws the returned result", async () => {
    const onTap = jest.fn();
    mockServer.use(
      http.get(mockUrl("/events/ABCDEF23/attempts/attempt-id"), () => HttpResponse.json(attempt)),
      http.post(mockUrl("/events/ABCDEF23/attempts/attempt-id/tap"), async ({ request }) => {
        onTap(await request.json(), request.headers.get("Idempotency-Key"));
        return HttpResponse.json(won);
      }),
    );

    await fireEvent.press(await setupAttempt());

    expect(await screen.findByText("Map completed · 3 points")).toBeOnTheScreen();
    expect(onTap).toHaveBeenCalledWith({ seq: 0, cell: 6 }, expect.any(String));
  });

  test("recovers a committed move without posting it a second time", async () => {
    let game = attempt;
    const onTap = jest.fn();
    mockServer.use(
      http.get(mockUrl("/events/ABCDEF23/attempts/attempt-id"), () => HttpResponse.json(game)),
      http.post(mockUrl("/events/ABCDEF23/attempts/attempt-id/tap"), () => {
        onTap();
        game = won;
        return HttpResponse.error();
      }),
    );
    await fireEvent.press(await setupAttempt());

    const retry = await screen.findByRole("button", { name: "Try again" });
    await act(() => fireEvent.press(retry));

    await waitFor(() => expect(screen.getByText("Map completed · 3 points")).toBeOnTheScreen());
    expect(onTap).toHaveBeenCalledTimes(1);
  });
});
