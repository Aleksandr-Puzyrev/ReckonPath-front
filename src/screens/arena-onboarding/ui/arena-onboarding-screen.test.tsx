import { http, HttpResponse } from "msw/http";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

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
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: true,
}));
jest.mock("@widgets/board", () => ({ BoardDemo: () => null }));

const ALL_ELEMENTS = ["fence", "stream", "bridge", "heavy", "rock", "bomb"] as const;

const renderOnboarding = async () => {
  await render(<ArenaOnboardingScreen />, { wrapper: createQueryWrapper() });
  await screen.findByText("Ходите по очереди");
};

const next = () => fireEvent.press(screen.getByTestId("intro-next"));

const trackRulesSeen = () => {
  const calls: string[] = [];
  mockServer.use(
    http.put(mockUrl("/arena/rules-seen"), () => {
      calls.push("seen");
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return calls;
};

describe("ArenaOnboardingScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.replace.mockClear();
    mockRouter.back.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    useRulesStore.getState().reset();
    mockServer.reset();
  });

  test("shows three rule cards with the turn time of the league format", async () => {
    await renderOnboarding();

    expect(screen.getByText("1 / 3")).toBeOnTheScreen();
    expect(screen.getByText(/На ход 10 секунд в формате 6×6/)).toBeOnTheScreen();
    await next();
    expect(screen.getByText("Бомба = пропуск хода")).toBeOnTheScreen();
    await next();
    expect(screen.getByText("Кто первым — тот победил")).toBeOnTheScreen();
  });

  test("shows the unseen element cards, then stores the rules and opens the editor tutorial", async () => {
    const seen = trackRulesSeen();
    useRulesStore.getState().markSeen(ALL_ELEMENTS.filter((id) => id !== "rock"));
    await renderOnboarding();
    await next();
    await next();

    await next();
    expect(screen.getByText("Скала")).toBeOnTheScreen();
    expect(seen).toEqual([]);
    await fireEvent.press(screen.getByTestId("rule-card-ok"));

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/arena/map/[id]",
        params: { id: "tutorial" },
      }),
    );
    expect(seen).toEqual(["seen"]);
    expect(useRulesStore.getState().seenCards).toContain("rock");
  });

  test("«Я знаю правила» stores the rules on the server", async () => {
    const seen = trackRulesSeen();
    await renderOnboarding();

    await fireEvent.press(screen.getByTestId("intro-skip"));

    await waitFor(() => expect(seen).toEqual(["seen"]));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalled());
  });

  test("offers a retry and a way back when the arena does not load", async () => {
    mockServer.use(
      http.get(mockUrl("/arena"), () =>
        HttpResponse.json({ error: { code: "validation_failed" } }, { status: 400 }),
      ),
    );
    await render(<ArenaOnboardingScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByTestId("onboarding-retry")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Назад"));
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
