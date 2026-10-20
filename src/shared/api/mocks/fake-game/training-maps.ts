import type { components } from "../../generated/schema";

type PvpMap = components["schemas"]["PvpMap"];

// The mentor's and the player's ready 5×5 maps of the training match (готовые карты 5×5 наставника и игрока для тренировки).
export const TRAINING_MENTOR_MAP: PvpMap = {
  rows: 5,
  cols: 5,
  targets: [[1, 3]],
  bombs: [[3, 1]],
  streams: [
    [0, 2],
    [1, 2],
    [2, 2],
  ],
};

export const TRAINING_PLAYER_MAP: PvpMap = {
  rows: 5,
  cols: 5,
  targets: [[3, 3]],
  bombs: [[1, 1]],
};
