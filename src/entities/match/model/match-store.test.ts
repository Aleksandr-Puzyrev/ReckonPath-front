import { useMatchStore } from "./match-store";

describe("useMatchStore", () => {
  afterEach(() => useMatchStore.getState().reset());

  test("marks a running match as lost when the connection gives up", () => {
    useMatchStore.setState({ phase: "myTurn" });

    useMatchStore.getState().markLost();

    expect(useMatchStore.getState().phase).toBe("lost");
  });

  test("keeps the result of a finished match when the socket closes after it", () => {
    useMatchStore.setState({ phase: "ended" });

    useMatchStore.getState().markLost();

    expect(useMatchStore.getState().phase).toBe("ended");
  });

  test("starts a training search from a clean state and forgets it on reset", () => {
    useMatchStore.setState({ phase: "ended", matchId: "m1" });

    useMatchStore.getState().startTraining();
    expect(useMatchStore.getState()).toEqual(
      expect.objectContaining({ phase: "searching", matchId: null, isTraining: true }),
    );
    useMatchStore.getState().reset();

    expect(useMatchStore.getState().isTraining).toBe(false);
  });

  test("toggles a flag on a tile", () => {
    useMatchStore.getState().toggleFlag([1, 2]);
    expect(useMatchStore.getState().flags).toEqual([[1, 2]]);

    useMatchStore.getState().toggleFlag([1, 2]);

    expect(useMatchStore.getState().flags).toEqual([]);
  });
});
