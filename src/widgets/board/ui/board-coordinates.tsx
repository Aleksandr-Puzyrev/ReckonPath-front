import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { cellOrigin } from "../model/board-geometry";
import type { BoardGeometry } from "../model/board-geometry";

import { styles } from "./board-coordinates-styles";

interface IBoardCoordinates {
  geometry: BoardGeometry;
  children: ReactNode;
}

const FIRST_LETTER = "A".charCodeAt(0);

const columnLabel = (col: number) => String.fromCharCode(FIRST_LETTER + col);

const BoardCoordinates = ({ geometry, children }: IBoardCoordinates) => {
  const columns = Array.from({ length: geometry.cols }, (_, col) => col);
  const rows = Array.from({ length: geometry.rows }, (_, row) => row);

  return (
    <View style={styles.wrap} importantForAccessibility="no-hide-descendants">
      <View style={[styles.letters, { width: geometry.width }]}>
        {columns.map((col) => (
          <Text
            key={col}
            variant="caption"
            style={[
              styles.label,
              styles.text,
              { left: cellOrigin(geometry, col).x, width: geometry.cell },
            ]}
          >
            {columnLabel(col)}
          </Text>
        ))}
      </View>
      <View style={styles.row}>
        <View style={[styles.numbers, { height: geometry.height }]}>
          {rows.map((row) => (
            <View
              key={row}
              style={[
                styles.number,
                { top: cellOrigin(geometry, row * geometry.cols).y, height: geometry.cell },
              ]}
            >
              <Text variant="caption" style={styles.text}>
                {String(row + 1)}
              </Text>
            </View>
          ))}
        </View>
        {children}
      </View>
    </View>
  );
};

export default BoardCoordinates;
