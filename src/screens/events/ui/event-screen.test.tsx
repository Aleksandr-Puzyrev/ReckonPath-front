import { fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import EventScreen from "./event-screen";
import EventsScreen from "./events-screen";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
  useLocalSearchParams: () => ({ code: "ABCDEF23" }),
}));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  API_BASE_URL: "",
  HAS_BACKEND: true,
}));

const finishedEvent = {
  id: "event-id",
  title: "Autumn Storm",
  description: "",
  status: "finished",
  startsAt: "2026-11-01T12:00:00Z",
  endsAt: "2026-11-24T12:00:00Z",
  attemptsPerMap: 2,
  maps: ["map-id"],
  prizes: [{ coins: 25, gems: 0, xp: 0 }],
};

describe("competitive events", () => {
  beforeAll(() => i18n.changeLanguage("en"));
  afterEach(() => {
    mockServer.reset();
    mockPush.mockClear();
  });

  test("finds a private or finished event by its normalized code", async () => {
    mockServer.use(http.get(mockUrl("/events"), () => HttpResponse.json([])));
    await render(<EventsScreen />, { wrapper: createQueryWrapper() });

    await fireEvent.changeText(screen.getByLabelText("Event code"), " abcdef23 ");
    await fireEvent.press(screen.getByRole("button", { name: "Find event" }));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/events/[code]",
      params: { code: "ABCDEF23" },
    });
  });

  test("claims the prize on the finished event page for a player in a prize place", async () => {
    const onClaim = jest.fn();
    mockServer.use(
      http.get(mockUrl("/events/ABCDEF23"), () => HttpResponse.json(finishedEvent)),
      http.get(mockUrl("/events/ABCDEF23/leaderboard"), () =>
        HttpResponse.json([{ rank: 1, nickname: "Player4821", score: 3, moves: 7 }]),
      ),
      http.post(mockUrl("/events/ABCDEF23/claim"), () => {
        onClaim();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await render(<EventScreen />, { wrapper: createQueryWrapper() });
    await fireEvent.press(await screen.findByRole("button", { name: "Claim" }));

    expect(await screen.findByText("Reward claimed")).toBeOnTheScreen();
    expect(onClaim).toHaveBeenCalledTimes(1);
  });
});
