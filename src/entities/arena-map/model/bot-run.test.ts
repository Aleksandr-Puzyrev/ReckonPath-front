import { runBot } from "./bot-run";

describe("runBot", () => {
  test("finds every target and counts the moves", () => {
    const run = runBot({ rows: 5, cols: 5, targets: [[3, 4]], bombs: [[1, 1]] });

    expect(run.found).toBe(1);
    expect(run.taps.at(-1)).toBe(19);
    expect(run.moves).toBeGreaterThanOrEqual(run.taps.length);
  });

  test("plays the same run for the same map", () => {
    const map = { rows: 5, cols: 5, targets: [[0, 0]] as [number, number][] };

    expect(runBot(map).taps).toEqual(runBot(map).taps);
  });
});
