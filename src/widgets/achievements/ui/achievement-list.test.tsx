import { fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import AchievementList from "./achievement-list";

jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  API_BASE_URL: "",
  HAS_BACKEND: true,
}));

describe("profile achievements", () => {
  beforeAll(() => i18n.changeLanguage("en"));
  afterEach(() => mockServer.reset());

  test("shows progress and refreshes eligibility after claiming a reward", async () => {
    let claimed = false;
    mockServer.use(
      http.get(mockUrl("/me/achievements"), () =>
        HttpResponse.json([
          {
            id: "achievement-id",
            title: "Signal hunter",
            description: "",
            badge: "",
            conditions: [{ metric: "event_maps_won", minimum: 4 }],
            progress: { event_maps_won: 4 },
            reward: { coins: 20, gems: 0, xp: 0 },
            eligible: !claimed,
            claimed,
          },
        ]),
      ),
      http.post(mockUrl("/me/achievements/achievement-id/claim"), () => {
        claimed = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await render(<AchievementList />, { wrapper: createQueryWrapper() });
    expect(await screen.findByText("Event maps completed: 4 / 4")).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "Claim" }));

    expect(await screen.findByText("Reward claimed")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Claim" })).toBeNull();
  });
});
