import { BOMB_PENALTY_MOVES } from "@reckon-path/engine";
import type { GameEvent, Idx, Stars } from "@reckon-path/engine";

import type { PlayView } from "./play-view";
import type { ServerGame } from "./server-game";

const starsOf = (value: number | undefined): Stars | null =>
  value === 1 || value === 2 || value === 3 ? value : null;

// The server answers with the opened cell and the whole game; the board effects and haptics still speak the engine's events (сервер отвечает открытой клеткой и всей партией; эффекты поля и вибрация по-прежнему понимают события движка).
export const serverTapEvents = (cell: Idx, game: ServerGame, view: PlayView): GameEvent[] => {
  const reveal = view.revealed.get(cell);
  if (reveal === undefined) return [];
  const events: GameEvent[] = [];
  if (reveal.kind === "bomb") events.push({ type: "bomb", cell, penalty: BOMB_PENALTY_MOVES });
  else if (reveal.kind === "target") {
    events.push({ type: "targetFound", cell, left: view.targetCount - view.foundCount });
  } else events.push({ type: "reveal", cell, reveal });
  if (game.status === "won") {
    events.push({ type: "win", moves: game.moves, stars: starsOf(game.result?.stars) });
  }
  if (game.status === "lost") events.push({ type: "lose" });
  return events;
};
