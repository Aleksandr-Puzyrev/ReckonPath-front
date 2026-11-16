import { editFormatOf } from "./edit-format";

describe("editFormatOf", () => {
  test("keeps only the target and rock rules of Part 1 §2.7", () => {
    expect(editFormatOf(6, 8)).toMatchObject({
      targets: 5,
      caps: { rock: 12, stream: 48, fences: 96 },
    });
  });
});
