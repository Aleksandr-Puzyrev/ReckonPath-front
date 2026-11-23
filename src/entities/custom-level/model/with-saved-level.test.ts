import { levelSchema } from "@reckon-path/engine";

import type { SavedCustomLevel } from "./custom-level-type";
import { withSavedLevel } from "./with-saved-level";

const savedOf = (id: string, title: string): SavedCustomLevel => ({
  id,
  title,
  level: levelSchema.parse({
    v: 2,
    id: `u-${id}`,
    rows: 4,
    cols: 4,
    targets: [[0, 0]],
    probeMode: "distance",
  }),
  updatedAt: "2026-11-22T10:00:00Z",
});

describe("withSavedLevel", () => {
  test("puts a saved level first and replaces its old copy, keeping the limit", () => {
    const list = { levels: [savedOf("a", "A"), savedOf("b", "B")], max: 20 };

    expect(withSavedLevel(list, savedOf("b", "B2"))).toEqual({
      levels: [savedOf("b", "B2"), savedOf("a", "A")],
      max: 20,
    });
  });
});
