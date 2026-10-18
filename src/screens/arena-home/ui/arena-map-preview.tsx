import { levelOfMap } from "@entities/arena-map";
import type { ArenaMap } from "@entities/arena-map";
import { BoardMapPreview } from "@widgets/board";

interface IArenaMapPreview {
  map: ArenaMap;
  size: number;
}

const ArenaMapPreview = ({ map, size }: IArenaMapPreview) => (
  <BoardMapPreview level={levelOfMap(map.map)} taps={[]} size={size} />
);

export default ArenaMapPreview;
