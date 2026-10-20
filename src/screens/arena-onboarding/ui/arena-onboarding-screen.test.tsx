import { http, HttpResponse } from "msw/http";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { matchSession, useMatchStore } from "@entities/match";
import { useRulesStore } from "@entities/rules";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaOnboardingScreen from "./arena-onboarding-screen";

const mockRouter = { replace: jest.fn(), back: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@widgets/board", () => ({ BoardDemo: () => null }));

const ALL_ELEMENTS = ["fence", "stream", "bridge", "heavy", "rock", "bomb"] as const;

const renderOnboarding = async () => {
  await render(<ArenaOnboardingScreen />, { wrapper: createQueryWrapper() });
  await screen.findByText("Ходите по очереди");
};

const next = () => fireEvent.press(screen.getByTestId("intro-next"));

describe("ArenaOnboardingScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.replace.mockClear());

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
    useMatchStore.getState().reset();
    useRulesStore.getState().reset();
    mockServer.reset();
  });

  test("shows three rule cards with the turn time of the format (decision 0037 #5)", async () => {
    await renderOnboarding();

    expect(screen.getByText("1 / 3")).toBeOnTheScreen();
    expect(screen.getByText(/На ход 5 секунд в формате 5×5/)).toBeOnTheScreen();
    await next();
    expect(screen.getByText("Бомба = пропуск хода")).toBeOnTheScreen();
    await next();
    expect(screen.getByText("Кто первым — тот победил")).toBeOnTheScreen();
    expect(screen.getByText("К ТРЕНИРОВКЕ")).toBeOnTheScreen();
  });

  test("shows the unseen element cards and then starts the training (decision 0037 #4)", async () => {
    const training = jest.spyOn(matchSession, "training").mockImplementation(() => undefined);
    useRulesStore.getState().markSeen(ALL_ELEMENTS.filter((id) => id !== "rock"));
    await renderOnboarding();
    await next();
    await next();

    await next();
    expect(screen.getByText("Скала")).toBeOnTheScreen();
    expect(training).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId("rule-card-ok"));

    expect(training).toHaveBeenCalledWith(5);
    expect(useRulesStore.getState().seenCards).toContain("rock");
  });

  test("goes straight to the training when every element is known", async () => {
    const training = jest.spyOn(matchSession, "training").mockImplementation(() => undefined);
    useRulesStore.getState().markSeen(ALL_ELEMENTS);
    await renderOnboarding();
    await next();
    await next();

    await next();

    expect(training).toHaveBeenCalledWith(5);
  });

  test("opens the training match once the mentor's turn order is set", async () => {
    await renderOnboarding();

    await act(() =>
      useMatchStore.setState({ isTraining: true, phase: "myTurn", matchId: "match_1" }),
    );

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/arena/match/[id]",
      params: { id: "match_1" },
    });
  });

  test("tells about a lost connection and lets the training start again", async () => {
    const leave = jest.spyOn(matchSession, "leave");
    await renderOnboarding();

    await act(() => useMatchStore.setState({ isTraining: true, phase: "lost" }));

    expect(await screen.findByText("Нет связи с сервером")).toBeOnTheScreen();
    expect(leave).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId("intro-next")).toBeEnabled());
  });

  test("offers a retry and a way back when the arena does not load", async () => {
    mockServer.use(
      http.get(mockUrl("/arena"), () =>
        HttpResponse.json({ error: { code: "VALIDATION" } }, { status: 400 }),
      ),
    );
    await render(<ArenaOnboardingScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByTestId("onboarding-retry")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Назад"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("skips the rules but never the map (decision 0037 #4)", async () => {
    await renderOnboarding();

    await fireEvent.press(screen.getByTestId("intro-skip"));

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/arena/map/[id]",
      params: { id: "tutorial" },
    });
  });
});
