import { levelFromBackend } from "@reckon-path/engine";

import type { PublicBoard, Secrets } from "./campaign-types";

type Point = [number, number];

const NO_SECRETS: Secrets = { targets: [], bombs: [], buoys: [] };

const pointOf = ([row = 0, col = 0]: readonly number[]): Point => [row, col];

const pointsOf = (cells: readonly (readonly number[])[]) => cells.map(pointOf);

// The server shows targets, bombs and buoys only after the game; until then the layout has none of them (сервер показывает цели, бомбы и буи только после партии; до этого их в раскладке нет).
export const levelOfPublicBoard = (board: PublicBoard, id: string, secrets: Secrets = NO_SECRETS) =>
  levelFromBackend(
    {
      ...board,
      fences: board.fences.map(([from = [], to = []]): [Point, Point] => [
        pointOf(from),
        pointOf(to),
      ]),
      beacons: pointsOf(board.beacons),
      targets: pointsOf(secrets.targets),
      bombs: pointsOf(secrets.bombs),
      buoys: pointsOf(secrets.buoys),
    },
    id,
  );

export const campaignLevelId = (number: number) => `campaign-${number}`;
