import { act, cleanup, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { matchSession, useMatchStore } from "@entities/match";
import { useSettingsStore } from "@entities/settings";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaMatchScreen from "./arena-match-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("expo-keep-awake", () => ({ useKeepAwake: () => undefined }));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({
  useBoardFx: () => ({ play: jest.fn() }),
  BoardMapPreview: () => null,
  BoardRemote: ({
    onCellPress,
    onCellLongPress,
  }: {
    onCellPress: (idx: number) => void;
    onCellLongPress: (idx: number) => void;
  }) => {
    const { Pressable, View } = jest.requireActual("react-native");
    return (
      <View>
        <Pressable
          testID="cell-7"
          onPress={() => onCellPress(7)}
          onLongPress={() => onCellLongPress(7)}
        />
      </View>
    );
  },
}));

const OPPONENT = {
  id: "u2",
  nickname: "Kira",
  league: "GOLD",
  trophies: 0,
  isBot: false,
  label: null,
};
const FORMAT = { size: 5, targets: 1, turnSec: 5, bombHint: true, maxTurns: 40 };
const DEADLINE = Date.now() + 60_000;

const playing = (state: Partial<ReturnType<typeof useMatchStore.getState>> = {}) =>
  useMatchStore.setState({
    phase: "myTurn",
    matchId: "m1",
    opponent: OPPONENT,
    format: FORMAT,
    layout: {},
    opponentBombs: 2,
    turn: 3,
    current: "me",
    deadline: DEADLINE,
    ...state,
  });

const renderMatch = async () => {
  await render(<ArenaMatchScreen />, { wrapper: createQueryWrapper() });
  await fireEvent(screen.getByTestId("match-board-area"), "layout", {
    nativeEvent: { layout: { width: 320 } },
  });
};

const emit = (event: { kind: string; count?: number }) =>
  act(() =>
    useMatchStore.setState((state) => ({
      event: { id: (state.event?.id ?? 0) + 1, count: 0, ...event } as never,
    })),
  );

describe("ArenaMatchScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.back.mockClear();
    mockRouter.replace.mockClear();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
    useMatchStore.getState().reset();
    mockServer.reset();
  });

  test("shows my turn, both counters and the turn number (decision 0034 #3)", async () => {
    playing();
    await renderMatch();

    expect(screen.getByTestId("turn-banner")).toHaveTextContent("Твой ход");
    expect(screen.getByText("сигналы 0/1")).toBeOnTheScreen();
    expect(screen.getByText("найдено 0/1 · × 2")).toBeOnTheScreen();
    expect(screen.getByText("Ход 3 / 40")).toBeOnTheScreen();
  });

  test("sends a tap on my turn and none on the opponent's (PVP-01, PVP-02)", async () => {
    const tap = jest.spyOn(matchSession, "tap").mockImplementation(() => undefined);
    playing({ phase: "opponentTurn", current: "opponent" });
    await renderMatch();

    await fireEvent.press(screen.getByTestId("cell-7"));
    expect(tap).not.toHaveBeenCalled();
    await act(() => useMatchStore.setState({ phase: "myTurn", current: "me" }));
    await fireEvent.press(screen.getByTestId("cell-7"));

    expect(tap).toHaveBeenCalledWith([1, 2]);
  });

  test("asks for a second tap when the PvP tap confirmation is on (decision 0040 #7)", async () => {
    const tap = jest.spyOn(matchSession, "tap").mockImplementation(() => undefined);
    useSettingsStore.getState().togglePvpTapConfirm();
    playing();
    await renderMatch();

    await fireEvent.press(screen.getByTestId("cell-7"));
    expect(tap).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId("cell-7"));

    expect(tap).toHaveBeenCalledWith([1, 2]);
    useSettingsStore.getState().reset();
  });

  test("puts a flag in any turn (decision 0034 #5)", async () => {
    playing({ phase: "opponentTurn", current: "opponent" });
    await renderMatch();

    await fireEvent.press(screen.getByTestId("match-flag"));
    await fireEvent.press(screen.getByTestId("cell-7"));

    expect(useMatchStore.getState().flags).toEqual([[1, 2]]);
  });

  test("tells about my bomb and a second timeout (PVP-03, PVP-05)", async () => {
    playing();
    await renderMatch();

    await emit({ kind: "myBomb" });
    expect(await screen.findByText("Бомба! Ты пропускаешь следующий ход")).toBeOnTheScreen();
    await emit({ kind: "timeout", count: 2 });

    expect(
      await screen.findByText("Время вышло — ход пропущен (2/3). Ещё один пропуск — поражение"),
    ).toBeOnTheScreen();
  });

  test("sends an emote and shows the opponent's one unless muted (PVP-27)", async () => {
    const emote = jest.spyOn(matchSession, "emote").mockImplementation(() => null);
    playing();
    await renderMatch();

    await fireEvent.press(screen.getByTestId("match-emotes"));
    await fireEvent.press(screen.getByTestId("emote-echo"));
    expect(emote).toHaveBeenCalledWith("echo");

    await act(() =>
      useMatchStore.setState({ emote: { player: "opponent", emote: "wow" }, emoteId: 1 }),
    );
    expect(screen.getByTestId("bubble-opponent")).toHaveTextContent("Ого!");

    await fireEvent.press(screen.getByTestId("match-menu"));
    await fireEvent(screen.getByTestId("match-mute"), "valueChange", true);
    expect(screen.queryByTestId("bubble-opponent")).toBeNull();
  });

  test("asks before giving up with the exact trophy loss (PVP-15)", async () => {
    const surrender = jest.spyOn(matchSession, "surrender").mockImplementation(() => null);
    playing();
    await renderMatch();

    await fireEvent.press(screen.getByTestId("match-menu"));
    await fireEvent.press(screen.getByTestId("match-surrender"));
    expect(screen.getByText("Сдаться? Ты потеряешь 0 кубков")).toBeOnTheScreen();
    await fireEvent.press(
      screen.getAllByText("Сдаться").at(-1) ?? screen.getByTestId("match-menu"),
    );

    expect(surrender).toHaveBeenCalled();
  });

  test("covers the board while reconnecting (decision 0034 #8)", async () => {
    playing({ isReconnecting: true });
    await renderMatch();

    expect(screen.getByText("Восстанавливаем связь…")).toBeOnTheScreen();
  });

  test("shows the mentor, the step hint and no surrender in training (decision 0037 #6)", async () => {
    playing({ isTraining: true, opponent: { ...OPPONENT, id: "mentor", isBot: true } });
    await renderMatch();

    expect(screen.getByText("Наставник · ТРЕНИРОВКА")).toBeOnTheScreen();
    expect(screen.getByText("лёгкий бот · кубки не меняются")).toBeOnTheScreen();
    expect(screen.getByText(/сдаться нельзя — это тренировка/)).toBeOnTheScreen();
    expect(screen.getByText("Тапни любую клетку")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("match-menu"));
    expect(screen.queryByTestId("match-surrender")).toBeNull();
  });

  test("goes on to the editor tutorial after the training ends (decision 0037 #6)", async () => {
    const leave = jest.spyOn(matchSession, "leave").mockImplementation(() => undefined);
    playing({ isTraining: true });
    await renderMatch();

    await act(() =>
      useMatchStore.setState({
        phase: "ended",
        end: {
          result: "loss",
          reason: "targets",
          turns: { me: 4, opponent: 4 },
          maps: { mine: { targets: [], bombs: [] }, opponent: { targets: [], bombs: [] } },
          trophies: { before: 0, after: 0, delta: 0 },
          league: { changed: false },
          rp: 0,
          rewards: [],
        },
      }),
    );
    expect(screen.getByText("Наставник оказался быстрее")).toBeOnTheScreen();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId("training-next"));

    expect(leave).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/arena/map/[id]",
      params: { id: "tutorial" },
    });
  });

  test("moves on to the result screen when the match ends (decision 0035 #3)", async () => {
    playing();
    await renderMatch();

    await act(() => useMatchStore.setState({ phase: "ended" }));

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/arena/result/[id]",
      params: { id: "m1" },
    });
  });
});
