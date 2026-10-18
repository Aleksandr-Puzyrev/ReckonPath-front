import { toIdx } from "@reckon-path/engine";

import type { MatchDetails } from "@entities/match";

type Player = MatchDetails["taps"][number]["player"];

export const tapsOnMap = (taps: MatchDetails["taps"], player: Player, cols: number) =>
  taps
    .filter((tap) => tap.player === player)
    .map(({ cell: [row, col] }) => toIdx(cols, [row, col]));
