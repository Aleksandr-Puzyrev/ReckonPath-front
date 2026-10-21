import { render, screen } from "@testing-library/react-native";
import { Pressable } from "react-native";

import { computeBoardGeometry } from "../model/board-geometry";

import BoardCoordinates from "./board-coordinates";

const BOARD_SIZE = 300;

describe("BoardCoordinates", () => {
  test("hides only the labels from the screen reader, not the board (rule 15)", async () => {
    await render(
      <BoardCoordinates geometry={computeBoardGeometry(5, 5, BOARD_SIZE)}>
        <Pressable testID="cell" accessibilityLabel="C4" />
      </BoardCoordinates>,
    );

    expect(screen.getByLabelText("C4")).toBeOnTheScreen();
    expect(screen.queryByText("A")).toBeNull();
    expect(screen.getByText("A", { includeHiddenElements: true })).toBeTruthy();
  });
});
