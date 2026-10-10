import { PREVIEW_LEVEL } from "@entities/level";

import { tryoutVisualsOf } from "./tryout-visuals";

describe("tryoutVisualsOf", () => {
  const level = PREVIEW_LEVEL;
  if (level === undefined) throw new Error("A 5×5 campaign level is required");

  test("starts with every cell hidden", () => {
    expect(tryoutVisualsOf(level, []).every(({ content }) => content.type === "hidden")).toBe(true);
  });

  test("opens a tapped cell and leaves the rest hidden", () => {
    const visuals = tryoutVisualsOf(level, [0]);

    expect(visuals[0]?.content.type).not.toBe("hidden");
    expect(visuals.filter(({ content }) => content.type !== "hidden")).toHaveLength(1);
  });
});
