import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useCampaignFlagsStore } from "@entities/level";
import { useRulesStore } from "@entities/rules";
import { useSettingsStore } from "@entities/settings";
import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockCampaignState, mockServer, passMockLevels } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import PlayScreen from "./play-screen";

const mockParams = { mode: "campaign", id: "1" };
const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: () => true };

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockParams,
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/haptics", () => ({ haptic: jest.fn() }));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@reckon-path/content", () => ({
  ...jest.requireActual("@reckon-path/content"),
  ...jest.requireActual("../test-utils/guide-levels"),
}));
jest.mock("@widgets/board", () => jest.requireActual("../test-utils/fake-board"));

const BOARD_LAYOUT = { nativeEvent: { layout: { width: 358, height: 358 } } };
const FIRST_CELL = 9;
const CLOSER_CELL = 10;
const TARGET = 6;

const FLUSHES = 10;

const flushRequests = () => act(() => jest.advanceTimersByTimeAsync(1));

const renderScreen = async (number: number) => {
  mockParams.id = String(number);
  await render(<PlayScreen />, { wrapper: createQueryWrapper() });
  for (let step = 0; step < FLUSHES && screen.queryByTestId("board-area") === null; step += 1) {
    await flushRequests();
  }
  await fireEvent(screen.getByTestId("board-area"), "layout", BOARD_LAYOUT);
};

const tap = async (cell: number) => {
  await fireEvent.press(screen.getByTestId(`cell-${cell}`));
  await flushRequests();
  await act(async () => jest.advanceTimersByTime(300));
};

const unlockUpTo = (passed: number) => passMockLevels(passed);

const movesUsed = () =>
  mockCampaignState()
    .games.at(-1)
    ?.actions.filter((action) => "tap" in action).length ?? 0;

describe("PlayScreen guides", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("ru");
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockRouter.replace.mockClear();
    useCampaignFlagsStore.getState().reset();
    useRulesStore.getState().reset();
    useSettingsStore.getState().reset();
  });

  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("walks through the four tutorial steps and ends with three stars (Part 4 §2.2)", async () => {
    await renderScreen(1);
    expect(screen.getByText("Тапни по любой клетке")).toBeOnTheScreen();
    await tap(0);
    expect(movesUsed()).toBe(0);

    await tap(FIRST_CELL);
    expect(screen.getByText("Число — сколько шагов до сигнала")).toBeOnTheScreen();
    await tap(CLOSER_CELL);
    expect(movesUsed()).toBe(1);

    await fireEvent.press(screen.getByText("Далее"));
    expect(screen.getByText("Тапни ближе — число уменьшится")).toBeOnTheScreen();
    await tap(0);
    expect(movesUsed()).toBe(1);
    await tap(CLOSER_CELL);

    expect(screen.getByText("Теперь найди сигнал сам")).toBeOnTheScreen();
    expect(screen.queryByText("Пропустить")).toBeNull();
    await tap(TARGET);
    await act(async () => jest.advanceTimersByTime(1000));

    expect(screen.getByLabelText("Звёзды: 3 из 3")).toBeOnTheScreen();
    expect(
      screen.getByText("Первый уровень — всегда 3★. Дальше ходы будут ограничены"),
    ).toBeOnTheScreen();
    expect(useRulesStore.getState().tutorial).toBe("done");
    expect(mockCampaignState().tutorials).toContain("tut_first_level");
  });

  test("ends the tutorial with the simplified result and only «Дальше» (design 29.4, decision 0056 #7)", async () => {
    await renderScreen(1);
    await tap(FIRST_CELL);
    await tap(CLOSER_CELL);
    await fireEvent.press(screen.getByText("Далее"));
    await tap(CLOSER_CELL);
    await tap(TARGET);
    await act(async () => jest.advanceTimersByTime(1000));

    expect(screen.getByText("Сигнал найден!")).toBeOnTheScreen();
    expect(screen.queryByText("Уровень 1 пройден")).toBeNull();
    expect(screen.queryByText(/^Ходов:/)).toBeNull();
    expect(screen.queryByText("Ещё раз")).toBeNull();
    await act(async () => fireEvent.press(screen.getByText("Дальше")));

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: "2" },
    });
  });

  test("skips the tutorial to the levels, leaving level 1 unbeaten (ACC-04)", async () => {
    await renderScreen(1);
    await fireEvent.press(screen.getByText("Пропустить"));
    expect(useRulesStore.getState().tutorial).toBe("skipped");
    expect(mockRouter.replace).toHaveBeenCalledWith("/levels");
    expect(mockCampaignState().progress[1]).toBeUndefined();
  });

  test("shows the new elements one after another before the level, then never again", async () => {
    useRulesStore.getState().skipTutorial();
    unlockUpTo(2);
    await renderScreen(3);
    expect(screen.getByText("Маяк")).toBeOnTheScreen();
    expect(screen.getByText("Маяк уже светит: число на нём показано бесплатно")).toBeOnTheScreen();
    await tap(0);
    expect(movesUsed()).toBe(0);

    await fireEvent.press(screen.getByTestId("rule-card-ok"));
    expect(screen.getByText("Флажки")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("rule-card-ok"));
    expect(screen.queryByTestId("rule-card-ok")).toBeNull();
    expect(useRulesStore.getState().seenCards).toEqual(["beacon", "flags"]);
    expect(mockCampaignState().tutorials).toEqual(["beacon", "flags"]);
  });

  test("skips the element cards the server already knows as seen (decision 0060 #7)", async () => {
    useRulesStore.getState().skipTutorial();
    unlockUpTo(2);
    await apiClient.POST("/campaign/tutorials", { body: { key: "beacon" } });
    await renderScreen(3);

    expect(screen.getByText("Флажки")).toBeOnTheScreen();
    expect(screen.queryByText("Маяк")).toBeNull();
  });

  test("explains the move limit once on the server's tut_moves_limit level", async () => {
    useRulesStore.getState().skipTutorial();
    unlockUpTo(1);
    await renderScreen(2);
    expect(
      screen.getByText(
        "На уровень даётся ограниченное число ходов. Чем меньше потратишь, тем больше звёзд",
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Понятно"));
    expect(useRulesStore.getState().hasSeenMovesHint).toBe(true);
    expect(mockCampaignState().tutorials).toContain("tut_moves_limit");
  });

  test("opens the mode card from the ⓘ on the mode chip (Part 4 §5.1)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markMovesHintSeen();
    unlockUpTo(1);
    await renderScreen(2);
    await fireEvent.press(screen.getByTestId("mode-info"));
    expect(
      screen.getByText("Число на клетке — сколько шагов до сигнала. Меньше число — ближе сигнал"),
    ).toBeOnTheScreen();
  });

  test("lists only the met rules in the pause menu (Part 4 §5.3)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markMovesHintSeen();
    useRulesStore.getState().markSeen(["fence"]);
    unlockUpTo(1);
    await renderScreen(2);
    await fireEvent.press(screen.getByTestId("pause"));
    await fireEvent.press(screen.getByTestId("pause-rules"));

    expect(screen.getByTestId("rule-distance")).toBeOnTheScreen();
    expect(screen.getByTestId("rule-fence")).toBeOnTheScreen();
    expect(screen.queryByTestId("rule-beacon")).toBeNull();
    await fireEvent.press(screen.getByTestId("rule-fence"));
    expect(screen.getByText("Забор стоит между клетками. Сигнал обходит его")).toBeOnTheScreen();
  });

  describe("mine mark coach", () => {
    const NEXT_TO_BOMB = 4;

    beforeEach(() => {
      useRulesStore.getState().skipTutorial();
      useRulesStore.getState().markMovesHintSeen();
      useRulesStore.getState().markSeen(["bomb"]);
      unlockUpTo(4);
    });

    test("explains the first mine mark once and blocks taps until «Понятно» (Part 4 §2.3)", async () => {
      await renderScreen(4);
      await tap(NEXT_TO_BOMB);

      expect(screen.getByText("Значок мины")).toBeOnTheScreen();
      await tap(0);
      expect(movesUsed()).toBe(1);
      await fireEvent.press(screen.getByText("Понятно"));

      expect(screen.queryByText("Значок мины")).toBeNull();
      expect(useRulesStore.getState().seenCards).toContain("bombNear");
    });

    test("stays silent when the server sends no mine mark (LVL-BN6)", async () => {
      useRulesStore.getState().markSeen(["bombNear"]);
      await renderScreen(5);
      await tap(NEXT_TO_BOMB);

      expect(screen.queryByText("Значок мины")).toBeNull();
      await fireEvent.press(screen.getByTestId("pause"));
      await fireEvent.press(screen.getByTestId("pause-rules"));
      expect(screen.getByTestId("rule-bomb")).toBeOnTheScreen();
    });

    test("does not show the coach on a level without the mark even before it was seen", async () => {
      await renderScreen(5);
      await tap(NEXT_TO_BOMB);

      expect(screen.queryByText("Значок мины")).toBeNull();
      expect(movesUsed()).toBe(1);
    });
  });

  test("saves the sound and music switches from the pause menu", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markMovesHintSeen();
    unlockUpTo(1);
    await renderScreen(2);
    await fireEvent.press(screen.getByTestId("pause"));
    await fireEvent(screen.getByTestId("sound"), "valueChange", false);
    await fireEvent(screen.getByTestId("music"), "valueChange", true);
    expect(useSettingsStore.getState().volume).toEqual({ sound: 0, music: 40 });
  });
});
