import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useMatchStore } from "@entities/match";
import type { MatchView } from "@entities/match";
import { useSettingsStore } from "@entities/settings";
import { i18n } from "@shared/i18n";
import {
  mapMatchMock,
  matchViewMock,
  mockServer,
  mockUrl,
  passMockLevels,
  playingMatchMock,
  setMockMatch,
} from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaMatchScreen from "./arena-match-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn() };
const mockParams = { id: "match-live" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock("expo-keep-awake", () => ({ useKeepAwake: () => undefined }));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: true,
}));
jest.mock("@shared/ws", () => ({
  arenaSocket: {
    open: () => undefined,
    close: () => undefined,
    onEvent: () => () => undefined,
    onReconnect: () => () => undefined,
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({
  useBoardFx: () => ({ play: jest.fn() }),
  BoardMapPreview: ({ testID }: { testID?: string }) => {
    const { View } = jest.requireActual("react-native");
    return <View testID={testID} />;
  },
  BoardRemote: ({
    onCellPress,
    onCellLongPress,
  }: {
    onCellPress: (idx: number) => void;
    onCellLongPress: (idx: number) => void;
  }) => {
    const { Pressable } = jest.requireActual("react-native");
    return (
      <Pressable
        testID="cell-7"
        onPress={() => onCellPress(7)}
        onLongPress={() => onCellLongPress(7)}
      />
    );
  },
}));

const receive = (view: MatchView) => act(() => useMatchStore.getState().receive(view));

const renderMatch = async (view: MatchView) => {
  useMatchStore.getState().receive(view);
  await render(<ArenaMatchScreen />, { wrapper: createQueryWrapper() });
  const area = screen.queryByTestId("match-board-area");
  if (area !== null) {
    await fireEvent(area, "layout", { nativeEvent: { layout: { width: 320 } } });
  }
};

const trackTaps = () => {
  const taps: unknown[] = [];
  mockServer.use(
    http.post(mockUrl("/arena/matches/:id/tap"), async ({ request }) => {
      taps.push(await request.json());
      return HttpResponse.json(playingMatchMock({ seq: 6, turn: "rival" }));
    }),
  );
  return taps;
};

describe("ArenaMatchScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockRouter.replace.mockClear();
    mockRouter.push.mockClear();
    mockParams.id = "match-live";
  });

  afterEach(async () => {
    await cleanup();
    useMatchStore.getState().reset();
    useSettingsStore.getState().reset();
    mockServer.reset();
  });

  describe("prepare", () => {
    test("shows the timer to the deadline, my map and the rival's readiness", async () => {
      const view = matchViewMock({ mapSeenByRival: true });
      await renderMatch({ ...view, rival: { ...view.rival, ready: true } });

      expect(screen.getByText("Подготовка к бою")).toBeOnTheScreen();
      expect(screen.getByTestId("prepare-timer")).toHaveTextContent(/^(59|60) с на выбор карты$/);
      expect(screen.getByTestId("prepare-map")).toBeOnTheScreen();
      expect(screen.getByText("Соперник готов")).toBeOnTheScreen();
      expect(screen.getByText("Соперник уже видел эту карту")).toBeOnTheScreen();
      expect(
        screen.getByText("Не успеешь — уйдёт активная карта, без неё случайная"),
      ).toBeOnTheScreen();
    });

    test("chooses a random map and opens the editor to draw one", async () => {
      const bodies: unknown[] = [];
      mockServer.use(
        http.put(mockUrl("/arena/matches/:id/map"), async ({ request }) => {
          bodies.push(await request.json());
          return HttpResponse.json(matchViewMock({ seq: 2 }));
        }),
      );
      await renderMatch(matchViewMock());

      await fireEvent.press(screen.getByTestId("prepare-random"));
      await waitFor(() => expect(bodies).toEqual([{ source: "random" }]));
      await fireEvent.press(screen.getByTestId("prepare-draw"));

      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/arena/map/[id]",
        params: { id: "draw", matchId: "match-live" },
      });
    });

    test("waits for the rival after «Готов»", async () => {
      mockServer.use(
        http.post(mockUrl("/arena/matches/:id/ready"), () => {
          const view = matchViewMock({ seq: 2 });
          return HttpResponse.json({ ...view, me: { ...view.me, ready: true } });
        }),
      );
      await renderMatch(matchViewMock());

      await fireEvent.press(screen.getByTestId("prepare-ready"));

      expect(await screen.findByText("Ждём соперника…")).toBeOnTheScreen();
      expect(screen.getByTestId("prepare-random")).toBeDisabled();
    });

    test("gives up with the server's surrender loss", async () => {
      setMockMatch(matchViewMock({ surrenderLoss: 30 }));
      await renderMatch(matchViewMock({ surrenderLoss: 30 }));

      await fireEvent.press(screen.getByTestId("prepare-surrender"));
      expect(screen.getByText("Сдаться? Ты потеряешь 30 кубков")).toBeOnTheScreen();
      await fireEvent.press(screen.getAllByText("Сдаться").at(-1) ?? screen.getByText("x"));

      await waitFor(() =>
        expect(mockRouter.replace).toHaveBeenCalledWith({
          pathname: "/arena/result/[id]",
          params: { id: "match-live" },
        }),
      );
    });
  });

  test("shows VS until startsAt with who goes first", async () => {
    await renderMatch(
      playingMatchMock({ first: "rival", startsAt: new Date(Date.now() + 3000).toISOString() }),
    );

    expect(screen.getByTestId("versus")).toBeOnTheScreen();
    expect(screen.getByText("Первым ходит: Kira")).toBeOnTheScreen();
  });

  describe("turns", () => {
    test("sends a tap with the cell and the seq on my turn and blocks input until the answer", async () => {
      const taps = trackTaps();
      await renderMatch(playingMatchMock({ seq: 5 }));

      expect(screen.getByText("Твой ход")).toBeOnTheScreen();
      await fireEvent.press(screen.getByTestId("cell-7"));
      await fireEvent.press(screen.getByTestId("cell-7"));

      await waitFor(() => expect(taps).toEqual([{ row: 1, col: 1, seq: 5 }]));
      expect(await screen.findByText("Ход соперника")).toBeOnTheScreen();
    });

    test("sends nothing on the rival's turn", async () => {
      const taps = trackTaps();
      await renderMatch(playingMatchMock({ turn: "rival" }));

      await fireEvent.press(screen.getByTestId("cell-7"));

      expect(taps).toEqual([]);
    });

    test("asks for a second tap when the PvP tap confirmation is on", async () => {
      const taps = trackTaps();
      useSettingsStore.setState({ isPvpTapConfirmOn: true });
      await renderMatch(playingMatchMock());

      await fireEvent.press(screen.getByTestId("cell-7"));
      expect(taps).toEqual([]);
      await fireEvent.press(screen.getByTestId("cell-7"));

      await waitFor(() => expect(taps).toHaveLength(1));
    });

    test("re-reads the match on stale_state", async () => {
      mockServer.use(
        http.post(mockUrl("/arena/matches/:id/tap"), () =>
          HttpResponse.json({ error: { code: "stale_state" } }, { status: 409 }),
        ),
        http.get(mockUrl("/arena/matches/current"), () =>
          HttpResponse.json(playingMatchMock({ seq: 9, turn: "rival" })),
        ),
      );
      await renderMatch(playingMatchMock({ seq: 5 }));

      await fireEvent.press(screen.getByTestId("cell-7"));

      await waitFor(() => expect(useMatchStore.getState().view?.seq).toBe(9));
      expect(screen.getByText("Ход соперника")).toBeOnTheScreen();
    });

    test("tells about a timeout with the count and warns before the last one", async () => {
      passMockLevels(12);
      const view = playingMatchMock({ seq: 5, turn: "rival" });
      await renderMatch(view);

      await receive({
        ...view,
        seq: 6,
        me: { ...view.me, timeouts: 2 },
        last: { turn: 1, by: "me", kind: "timeout", at: "2026-11-02T12:00:10Z" },
      });

      expect(
        await screen.findByText("Время вышло — ход пропущен (2/3). Ещё один пропуск — поражение"),
      ).toBeOnTheScreen();
    });

    test("tells that the rival hit my bomb", async () => {
      const view = playingMatchMock({ seq: 5 });
      await renderMatch(view);

      await receive({
        ...view,
        seq: 6,
        last: { turn: 1, by: "rival", cell: [1, 4], kind: "bomb", at: "2026-11-02T12:00:10Z" },
      });

      expect(await screen.findByText("Соперник на твоей бомбе — пропустит ход")).toBeOnTheScreen();
    });

    test("does not replay the last move of the match on opening", async () => {
      await renderMatch(
        playingMatchMock({
          seq: 5,
          last: { turn: 1, by: "rival", cell: [1, 4], kind: "bomb", at: "2026-11-02T12:00:10Z" },
        }),
      );

      expect(screen.queryByText("Соперник на твоей бомбе — пропустит ход")).toBeNull();
    });

    test("tells that the rival is reconnecting while the server sees them offline", async () => {
      const view = playingMatchMock({ seq: 5, rivalOnline: true });
      await renderMatch(view);
      expect(screen.queryByTestId("rival-offline")).toBeNull();

      await receive({ ...view, seq: 6, rivalOnline: false });

      expect(screen.getByText("Соперник переподключается")).toBeOnTheScreen();
    });

    test("shows the final turn banner from the server", async () => {
      await renderMatch(playingMatchMock({ final: true, turn: "me" }));

      expect(screen.getByText("Финальный ход!")).toBeOnTheScreen();
      expect(
        await screen.findByText("Все цели соперника найдены — твой финальный ход"),
      ).toBeOnTheScreen();
    });

    test("opens the result once the match is done", async () => {
      const view = playingMatchMock({ seq: 5 });
      await renderMatch(view);

      await receive({ ...view, seq: 6, status: "done" });

      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/arena/result/[id]",
        params: { id: "match-live" },
      });
    });
  });

  test("plays a map match without turns, against the norm and without my map", async () => {
    mockParams.id = "match-map";
    const taps = trackTaps();
    await renderMatch(mapMatchMock({ norm: 6 }));

    expect(screen.getByText("Ты: 0 ходов · Норма: 6")).toBeOnTheScreen();
    expect(screen.queryByTestId("match-my-map")).toBeNull();
    await fireEvent.press(screen.getByTestId("cell-7"));

    await waitFor(() => expect(taps).toHaveLength(1));
  });

  test("reads the match from the server when the store has another one", async () => {
    mockServer.use(
      http.get(mockUrl("/arena/matches/current"), () =>
        HttpResponse.json(matchViewMock({ id: "match-live", seq: 3 })),
      ),
    );
    useMatchStore.getState().receive(matchViewMock({ id: "other" }));
    await render(<ArenaMatchScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText("Подготовка к бою")).toBeOnTheScreen();
  });
});
