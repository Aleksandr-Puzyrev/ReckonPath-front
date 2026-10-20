import { useState } from "react";
import { View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { levelOfMap } from "@entities/arena-map";
import { BoardEditor } from "@widgets/board";

import type { ReadyMapEditor } from "../model/use-map-editor";

import { styles } from "./arena-map-styles";

interface IEditorBoard {
  editor: ReadyMapEditor;
}

const EditorBoard = ({ editor }: IEditorBoard) => {
  const { theme } = useUnistyles();
  const [boardWidth, setBoardWidth] = useState(0);
  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setBoardWidth(nativeEvent.layout.width);

  return (
    <View testID="editor-board-area" style={styles.boardArea} onLayout={handleLayout}>
      {boardWidth > 0 ? (
        <BoardEditor
          level={levelOfMap(editor.session.map)}
          size={boardWidth - theme.sizes.arena.coordinates}
          fx={editor.fx}
          gesture={editor.gesture}
          taps={editor.check.taps}
          errors={editor.errorCells}
          onStrokeStart={editor.handleStrokeStart}
          onStrokeCell={editor.handleStrokeCell}
          onStrokeEdge={editor.handleStrokeEdge}
          onStrokeEnd={editor.handleStrokeEnd}
        />
      ) : null}
    </View>
  );
};

export default EditorBoard;
