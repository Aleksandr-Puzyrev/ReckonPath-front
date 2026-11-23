import { cleanup, fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { i18n } from "@shared/i18n";
import { doneMatchMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import MatchDetailsScreen from "./match-details-screen";

const mockRouter = { back: jest.fn(), push: jest.fn() };
const mockParams = { id: "m1" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: true,
}));
jest.mock("@widgets/board", () => ({
  BoardMapPreview: ({ testID }: { testID?: string }) => {
    const { View } = jest.requireActual("react-native");
    return <View testID={testID} />;
  },
}));

const serve = (match: ReturnType<typeof doneMatchMock>) =>
  mockServer.use(http.get(mockUrl("/arena/matches/m1"), () => HttpResponse.json(match)));

describe("MatchDetailsScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
  });

  test("shows the result, the moves and both maps from GET /arena/matches/{id}", async () => {
    const done = doneMatchMock({ id: "m1" });
    serve({
      ...done,
      me: { ...done.me, moves: 9 },
      rival: { ...done.rival, moves: 8 },
      result:
        done.result === undefined ? undefined : { ...done.result, outcome: "loss", trophies: -12 },
    });
    await render(<MatchDetailsScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText("Матч с Kira")).toBeOnTheScreen();
    expect(screen.getByText("Поражение · −12")).toBeOnTheScreen();
    expect(screen.getByText("9 : 8")).toBeOnTheScreen();
    expect(screen.getByTestId("details-my-map")).toBeOnTheScreen();
    expect(screen.getByTestId("details-their-map")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("details-back"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("shows only the author's map for a map match", async () => {
    serve(doneMatchMock({ id: "m1", kind: "map", myMap: undefined }));
    await render(<MatchDetailsScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByTestId("details-their-map")).toBeOnTheScreen();
    expect(screen.queryByTestId("details-my-map")).toBeNull();
  });

  test("marks a friendly match instead of a zero (decision 0062 #25)", async () => {
    const done = doneMatchMock({ id: "m1" });
    serve({
      ...done,
      friendly: true,
      result: done.result === undefined ? undefined : { ...done.result, trophies: 0 },
    });
    await render(<MatchDetailsScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText("Победа · дружеский")).toBeOnTheScreen();
  });

  test("opens the rival's profile from his name (decision 0066 #9)", async () => {
    const done = doneMatchMock({ id: "m1" });
    serve({ ...done, rival: { ...done.rival, id: "player-7", name: "Miron" } });
    await render(<MatchDetailsScreen />, { wrapper: createQueryWrapper() });

    await fireEvent.press(await screen.findByLabelText("Открыть профиль Miron"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/user/[id]",
      params: { id: "player-7" },
    });
  });

  test("never opens a profile for a bot (decision 0066 #9)", async () => {
    const done = doneMatchMock({ id: "m1" });
    serve({ ...done, kind: "bot", rival: { ...done.rival, id: undefined, bot: true } });
    await render(<MatchDetailsScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText("Матч с Kira")).toBeOnTheScreen();
    expect(screen.queryByTestId("details-rival")).toBeNull();
  });
});
