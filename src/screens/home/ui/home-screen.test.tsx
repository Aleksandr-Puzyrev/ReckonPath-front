import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { delay, http, HttpResponse } from "msw";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { useRulesStore } from "@entities/rules";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import {
  MOCK_CAMPAIGN_LEVELS,
  mockServer,
  mockUrl,
  passMockLevels,
} from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import HomeScreen from "./home-screen";

const mockRouter = { replace: jest.fn(), push: jest.fn(), navigate: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardPreview: () => null }));
jest.mock("@widgets/daily-card", () => ({
  DailyCard: ({ onOpen }: { onOpen: () => void }) => {
    const { Pressable } = jest.requireActual("react-native");
    return <Pressable testID="daily-card" onPress={onOpen} />;
  },
}));

const passLevels = (count: number, stars?: number) => passMockLevels(count, stars);

const renderHome = async () => {
  useAccountStore.getState().markSignedIn();
  await render(<HomeScreen />, { wrapper: createQueryWrapper() });
  // The top bar shows the balance once the player's data arrives (верхняя панель показывает баланс, когда приходят данные игрока).
  await screen.findByTestId("wallet-emeralds");
};

describe("HomeScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    Object.values(mockRouter).forEach((mock) => mock.mockClear());
    useRulesStore.getState().reset();
  });

  afterEach(async () => {
    useAccountStore.getState().reset();
    await cleanup();
    mockServer.reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("opens the server's tutorial level on the first launch (ACC-01, decision 0060 #7)", async () => {
    await renderHome();

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/play/[mode]/[id]",
        params: { mode: "campaign", id: "1" },
      }),
    );
  });

  test("does not open the tutorial the server already knows as seen", async () => {
    await apiClient.POST("/campaign/tutorials", { body: { key: "tut_first_level" } });
    await renderHome();
    await screen.findByTestId("current-game");

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  test("does not open the tutorial again once it is skipped (ACC-04)", async () => {
    useRulesStore.getState().skipTutorial();
    await renderHome();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  test("opens the daily from its card", async () => {
    useRulesStore.getState().skipTutorial();
    await renderHome();

    await fireEvent.press(screen.getByTestId("daily-card"));

    expect(mockRouter.push).toHaveBeenCalledWith("/daily");
  });

  test("shows the balance and opens the ways to earn from it (LVL-26)", async () => {
    useRulesStore.getState().skipTutorial();
    await renderHome();

    expect(screen.getByLabelText("Изумруды: 2640")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("wallet-coins"));

    expect(screen.getByText("Где получить изумруды:")).toBeOnTheScreen();
    expect(await screen.findByText("сегодня 0 / 5")).toBeOnTheScreen();
  });
  test("offers the current level with its limit, world and elements (Part 4 §3.1)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markHomeTourSeen();
    passLevels(3);
    await renderHome();

    const limit = MOCK_CAMPAIGN_LEVELS[3]?.level.moveLimit ?? 0;
    expect(await screen.findByText("Уровень 4")).toBeOnTheScreen();
    expect(screen.getByText("Мир 1 · Тихая бухта")).toBeOnTheScreen();
    expect(
      await screen.findByText(i18n.t("home.moves", { count: limit }).toUpperCase()),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("current-game-play"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "4" },
    });
  });

  test("continues the server's unfinished game straight away (decision 0041 #3, 0060 #2)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markHomeTourSeen();
    passLevels(3);
    await apiClient.POST("/campaign/levels/{number}/play", { params: { path: { number: 4 } } });
    await renderHome();

    expect(await screen.findByText(/^найдено \d+ \/ \d+$/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("current-game-play"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "4", resume: "1" },
    });
  });

  test("tells the campaign is complete and leads to the first level below 3★ (design 19.5)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markHomeTourSeen();
    passLevels(MOCK_CAMPAIGN_LEVELS.length, 2);
    await renderHome();

    expect(await screen.findByText("Кампания пройдена")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("campaign-collect"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "1" },
    });
  });

  test("shows stars and levels and the locked arena before level 12 (design 19.3)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markHomeTourSeen();
    passLevels(3);
    await renderHome();

    expect(await screen.findByText("с уровня 12")).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByTestId("today-stars")).toHaveTextContent("Звёзды9"));
    expect(screen.getByTestId("today-levels")).toHaveTextContent("Уровни3");
    expect(screen.queryByTestId("today-trophies")).toBeNull();
  });

  test("shows the league and trophies once the arena is open (decision 0041 #1, #7)", async () => {
    useAccountStore.getState().markSignedIn();
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markHomeTourSeen();
    passLevels(12);
    await renderHome();

    expect(await screen.findByText("BRONZE III · 0")).toBeOnTheScreen();
    expect(screen.getByTestId("today-trophies")).toHaveTextContent("Кубки0");
    expect(screen.queryByTestId("today-stars")).toBeNull();
    await fireEvent.press(screen.getByTestId("home-arena"));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/arena");
  });

  test("shows a guest only what the device knows (decision 0051 #2)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markHomeTourSeen();
    passLevels(12);
    await render(<HomeScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByTestId("today-stars")).toBeOnTheScreen();
    expect(screen.getByTestId("today-levels")).toBeOnTheScreen();
    expect(screen.queryByTestId("today-streak")).toBeNull();
    expect(screen.queryByTestId("today-trophies")).toBeNull();
  });

  test("shows a guest no showroom drop (decision 0051 #2)", async () => {
    useRulesStore.getState().skipTutorial();
    await render(<HomeScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByTestId("home-shop")).toBeOnTheScreen();
    expect(screen.queryByTestId("home-drop")).toBeNull();
  });

  test("shows the drop timer on the shop link", async () => {
    useAccountStore.getState().markSignedIn();
    useRulesStore.getState().skipTutorial();
    await renderHome();

    expect(await screen.findByTestId("home-drop")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("home-shop"));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/shop");
  });

  test("shows the offline banner and the cache time (design 19.6)", async () => {
    useRulesStore.getState().skipTutorial();
    await renderHome();

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByText("Нет сети. Кампания и дейли работают без интернета")).toBeOnTheScreen();
    expect(screen.getByText(/^Обновлено \d{1,2}:\d{2}$/)).toBeOnTheScreen();
  });

  test("offers to restore a streak missed yesterday instead of the daily card (design 19.4)", async () => {
    useRulesStore.getState().skipTutorial();
    const DAY_MS = 86_400_000;
    const dayKey = (shift: number) =>
      new Date(Date.now() + shift * DAY_MS).toISOString().slice(0, 10);
    mockServer.use(
      http.get(mockUrl("/streak"), () =>
        HttpResponse.json({
          current: 0,
          best: 19,
          lastDay: dayKey(-2),
          todayDone: false,
          broken: 12,
          restorable: true,
          restoreCost: 30,
          milestones: [],
        }),
      ),
    );
    await renderHome();

    expect(await screen.findByTestId("restore-emeralds")).toBeOnTheScreen();
    expect(screen.queryByTestId("daily-card")).toBeNull();
  });

  test("shows the blocks offline without a cache instead of endless skeletons (decision 0041 #8)", async () => {
    useAccountStore.getState().markSignedIn();
    useRulesStore.getState().skipTutorial();
    await act(async () => onlineManager.setOnline(false));

    await render(<HomeScreen />, { wrapper: createQueryWrapper() });

    expect(screen.queryByTestId("home-skeleton", { includeHiddenElements: true })).toBeNull();
    expect(screen.getByTestId("home-shop")).toBeOnTheScreen();
    expect(screen.getByTestId("today-streak")).toBeOnTheScreen();
  });

  test("shows the Home coach marks once after level 3 (decision 0042 #5, design 19.8)", async () => {
    useRulesStore.getState().skipTutorial();
    passLevels(3);
    await render(<HomeScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText("Здесь твой текущий уровень")).toBeOnTheScreen();
    expect(screen.getByText("1 / 2")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Дальше"));
    expect(screen.getByText("Все уровни — здесь")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Понятно"));

    expect(screen.queryByTestId("home-tour")).toBeNull();
    expect(useRulesStore.getState().hasSeenHomeTour).toBe(true);
  });

  test("keeps the coach marks back before level 3", async () => {
    useRulesStore.getState().skipTutorial();
    passLevels(2);
    await renderHome();

    expect(screen.queryByTestId("home-tour")).toBeNull();
  });

  test("shows skeletons while the player's data loads (design 19.7)", async () => {
    useRulesStore.getState().skipTutorial();
    mockServer.use(
      http.get(mockUrl("/me"), async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );
    await render(<HomeScreen />, { wrapper: createQueryWrapper() });

    expect(screen.getByTestId("home-skeleton", { includeHiddenElements: true })).toBeTruthy();
    expect(await screen.findByTestId("current-game")).toBeOnTheScreen();
  });
});
