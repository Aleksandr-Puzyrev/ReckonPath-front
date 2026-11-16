import { toIdx } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import type { MoveView } from "@entities/match";

// The log keeps both players' moves in turn order, so each map replays its taps in the order they were made (журнал хранит ходы обоих игроков по порядку, поэтому каждая карта проигрывает свои тапы в порядке ходов).
export const tapsOfLog = (log: readonly MoveView[], by: MoveView["by"], cols: number): Idx[] =>
  [...log]
    .sort((a, b) => a.turn - b.turn)
    .flatMap(({ by: mover, cell }) =>
      mover === by && cell !== undefined ? [toIdx(cols, [cell[0] ?? 0, cell[1] ?? 0])] : [],
    );
