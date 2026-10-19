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

  test("toggles a flag on a tile", () => {
    useMatchStore.getState().toggleFlag([1, 2]);
    expect(useMatchStore.getState().flags).toEqual([[1, 2]]);

    useMatchStore.getState().toggleFlag([1, 2]);

    expect(useMatchStore.getState().flags).toEqual([]);
  });
});
