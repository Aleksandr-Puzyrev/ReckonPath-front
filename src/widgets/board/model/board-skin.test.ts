import { boardSkinFor } from "./board-skin";
import skin from "./default-skin.json";

describe("boardSkinFor", () => {
  test("is the default skin of the theme without parts", () => {
    expect(boardSkinFor("dark")).toEqual({ ...skin.dark, elements: skin.elements });
  });

  test("takes the frame, cells and numbers of a board skin", () => {
    const result = boardSkinFor("light", [
      {
        frame: { gradient: ["color-1", "color-2"] },
        cell: { stops: ["color-3", "color-4", "color-5"] },
        number: "color-6",
      },
    ]);

    expect(result).toMatchObject({
      frame: ["color-1", "color-2"],
      cell: ["color-3", "color-4", "color-5"],
      number: "color-6",
      cellSide: skin.light.cellSide,
    });
  });

  test("recolours known elements of the same shape only", () => {
    const result = boardSkinFor("dark", [
      {
        elements: {
          fence: "fence-color",
          stream: ["stream-1", "stream-2", "stream-3"],
          laser: "laser-color",
          mine: ["mine-1", "mine-2"],
        },
      },
    ]);

    expect(result.elements.fence).toBe("fence-color");
    expect(result.elements.stream).toEqual(["stream-1", "stream-2", "stream-3"]);
    expect(result.elements.mine).toBe(skin.elements.mine);
    expect(result.elements).not.toHaveProperty("laser");
  });

  test("lets a later part win", () => {
    const result = boardSkinFor("dark", [{ number: "color-1" }, { number: "color-2" }]);

    expect(result.number).toBe("color-2");
  });
});
