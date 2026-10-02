import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useGameSessionStore } from "@entities/level";
import { useProgressStore } from "@entities/progress";
import { useRulesStore } from "@entities/rules";
import { useSettingsStore } from "@entities/settings";
import { unlockTapInput } from "@features/tap-cell";
import { i18n } from "@shared/i18n";

import PlayScreen from "./play-screen";

const mockParams = { mode: "campaign", id: "c-1" };
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

const renderScreen = async (id: string) => {
  mockParams.id = id;
  await render(<PlayScreen />);
  await fireEvent(screen.getByTestId("board-area"), "layout", BOARD_LAYOUT);
};

const tap = async (cell: number) => {
  await fireEvent.press(screen.getByTestId(`cell-${cell}`));
  await act(async () => jest.advanceTimersByTime(300));
};

const unlockUpTo = (...ids: string[]) =>
  ids.forEach((id) => useProgressStore.getState().recordWin(id, { stars: 3, moves: 2 }));

const movesUsed = () => useGameSessionStore.getState().game?.movesUsed;

describe("PlayScreen guides", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("ru");
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockRouter.replace.mockClear();
    unlockTapInput();
    useGameSessionStore.getState().reset();
    useProgressStore.getState().reset();
    useRulesStore.getState().reset();
    useSettingsStore.getState().reset();
  });

  afterEach(() => jest.useRealTimers());

  test("walks through the four tutorial steps and ends with three stars (Part 4 §2.2)", async () => {
    await renderScreen("c-1");
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
  });

  test("skips the tutorial to the levels, leaving level 1 unbeaten (ACC-04)", async () => {
    await renderScreen("c-1");
    await fireEvent.press(screen.getByText("Пропустить"));
    expect(useRulesStore.getState().tutorial).toBe("skipped");
    expect(mockRouter.replace).toHaveBeenCalledWith("/levels");
    expect(useProgressStore.getState().best["c-1"]).toBeUndefined();
  });

  test("shows the new elements one after another before the level, then never again", async () => {
    useRulesStore.getState().skipTutorial();
    unlockUpTo("c-1", "c-2");
    await renderScreen("c-3");
    expect(screen.getByText("Маяк")).toBeOnTheScreen();
    expect(screen.getByText("Маяк уже светит: число на нём показано бесплатно")).toBeOnTheScreen();
    await tap(0);
    expect(movesUsed()).toBe(0);

    await fireEvent.press(screen.getByTestId("rule-card-ok"));
    expect(screen.getByText("Флажки")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("rule-card-ok"));
    expect(screen.queryByTestId("rule-card-ok")).toBeNull();
    expect(useRulesStore.getState().seenCards).toEqual(["beacon", "flags"]);
  });

  test("explains the move limit once on level 2", async () => {
    useRulesStore.getState().skipTutorial();
    unlockUpTo("c-1");
    await renderScreen("c-2");
    expect(
      screen.getByText(
        "На уровень даётся ограниченное число ходов. Чем меньше потратишь, тем больше звёзд",
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Понятно"));
    expect(useRulesStore.getState().hasSeenMovesHint).toBe(true);
  });

  test("opens the mode card from the ⓘ on the mode chip (Part 4 §5.1)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markMovesHintSeen();
    unlockUpTo("c-1");
    await renderScreen("c-2");
    await fireEvent.press(screen.getByTestId("mode-info"));
    expect(
      screen.getByText("Число на клетке — сколько шагов до сигнала. Меньше число — ближе сигнал"),
    ).toBeOnTheScreen();
  });

  test("lists only the met rules in the pause menu (Part 4 §5.3)", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markMovesHintSeen();
    useRulesStore.getState().markSeen(["fence"]);
    unlockUpTo("c-1");
    await renderScreen("c-2");
    await fireEvent.press(screen.getByTestId("pause"));
    await fireEvent.press(screen.getByTestId("pause-rules"));

    expect(screen.getByTestId("rule-distance")).toBeOnTheScreen();
    expect(screen.getByTestId("rule-fence")).toBeOnTheScreen();
    expect(screen.queryByTestId("rule-beacon")).toBeNull();
    await fireEvent.press(screen.getByTestId("rule-fence"));
    expect(screen.getByText("Забор стоит между клетками. Сигнал обходит его")).toBeOnTheScreen();
  });

  test("saves the sound and music switches from the pause menu", async () => {
    useRulesStore.getState().skipTutorial();
    useRulesStore.getState().markMovesHintSeen();
    unlockUpTo("c-1");
    await renderScreen("c-2");
    await fireEvent.press(screen.getByTestId("pause"));
    await fireEvent(screen.getByTestId("sound"), "valueChange", false);
    await fireEvent(screen.getByTestId("music"), "valueChange", true);
    expect(useSettingsStore.getState()).toMatchObject({ isSoundOn: false, isMusicOn: true });
  });
});
