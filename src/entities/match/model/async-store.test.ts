import { useAsyncMatchStore } from "./async-store";
import type { AsyncFinish, AsyncMatch } from "./async-type";

const MATCH: AsyncMatch = {
  asyncId: "async_1",
  author: { id: "a1", nickname: "Milo", league: "GOLD" },
  map: { rows: 5, cols: 5 },
  bombCount: 1,
  targetsCount: 1,
  norm: 11,
  turnSec: 5,
  bombHint: true,
  deadline: "2026-10-19T12:00:05.300Z",
};

const FINISH: AsyncFinish = {
  finished: true,
  result: "win",
  turnsUsed: 9,
  norm: 11,
  trophiesDelta: 11,
  rp: 5,
  rewards: [],
  map: { targets: [[4, 4]], bombs: [[0, 4]] },
};

const state = () => useAsyncMatchStore.getState();

describe("useAsyncMatchStore", () => {
  afterEach(() => state().reset());

  test("starts with the author's match and the first deadline", () => {
    state().start(MATCH, 2640);

    expect(state()).toEqual(
      expect.objectContaining({
        match: MATCH,
        trophiesBefore: 2640,
        deadline: Date.parse(MATCH.deadline ?? ""),
      }),
    );
  });

  test("records a tap answer with the turns used and the next deadline", () => {
    state().start(MATCH, 0);
    state().setPendingCell([0, 0]);

    state().receiveTap([0, 0], {
      turn: 2,
      outcome: "bomb",
      turnsUsed: 2,
      deadline: "2026-10-19T12:00:10.600Z",
    });

    expect(state()).toEqual(expect.objectContaining({ turnsUsed: 2, pendingCell: null }));
    expect(state().taps).toEqual([{ cell: [0, 0], outcome: "bomb", value: null, bombNear: false }]);
  });

  test("shows the final tap on a target and keeps the result", () => {
    state().start(MATCH, 0);

    state().receiveFinish(FINISH, [4, 4]);

    expect(state().finish).toEqual(FINISH);
    expect(state().taps.at(-1)).toEqual(
      expect.objectContaining({ cell: [4, 4], outcome: "target" }),
    );
  });

  test("toggles a flag", () => {
    state().toggleFlag([1, 1]);
    state().toggleFlag([1, 1]);

    expect(state().flags).toEqual([]);
  });
});
