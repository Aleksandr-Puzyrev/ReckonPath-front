export type Idx = number;
export type EdgeKey = number;
export type Cell = readonly [row: number, col: number];
export type Point = [row: number, col: number];
export type Fence = [Point, Point];

export type CellKind = "open" | "stream" | "heavy" | "rock";
export type ProbeMode = "distance" | "direction" | "hotcold";
export type Heat = "hot" | "warm" | "cold";
export type Direction = "N" | "E" | "S" | "W";
export type HotColdCompare = "warmer" | "colder" | "same" | "none";
export type GameStatus = "playing" | "won" | "lost";
export type GameVariant = "level" | "pvp";
export type Stars = 1 | 2 | 3;

export interface Board {
  rows: number;
  cols: number;
  kinds: CellKind[];
  bridges: ReadonlySet<Idx>;
  fences: ReadonlySet<EdgeKey>;
  targets: Idx[];
  bombs: Idx[];
  beacons: Idx[];
  buoys: Idx[];
  targetOrder: boolean;
}

export interface LevelRules {
  probeMode: ProbeMode;
  moveLimit: number | null;
  stars: readonly [three: number, two: number] | null;
  bombHint: boolean;
  fog: number | null;
}

interface RevealMarks {
  epoch: number;
  bombNear: boolean;
  beacon?: true;
  buoy?: true;
}

export type Reveal =
  | ({ kind: "distance"; value: number; heat: Heat } & RevealMarks)
  | ({ kind: "direction"; dir: Direction } & RevealMarks)
  | ({ kind: "hotcold"; cmp: HotColdCompare; value: number } & RevealMarks)
  | { kind: "target"; bombNear: boolean; order?: number }
  | { kind: "bomb" };

export interface HeatConfig {
  hotPct: number;
  warmPct: number;
}

export interface GameState {
  board: Board;
  rules: LevelRules;
  variant: GameVariant;
  heatConfig: HeatConfig;
  dist: Int16Array;
  revealed: ReadonlyMap<Idx, Reveal>;
  found: ReadonlySet<Idx>;
  bombsHit: ReadonlySet<Idx>;
  movesUsed: number;
  bonusMoves: number;
  continued: boolean;
  epoch: number;
  lastValue: number | null;
  heatD: number;
  status: GameStatus;
}

export type GameEvent =
  | { type: "blocked"; cell: Idx }
  | { type: "alreadyRevealed"; cell: Idx }
  | { type: "reveal"; cell: Idx; reveal: Reveal }
  | { type: "targetFound"; cell: Idx; left: number }
  | { type: "bomb"; cell: Idx; penalty: 2 }
  | { type: "bomb"; cell: Idx; skipNext: 1 }
  | { type: "buoy"; cell: Idx; bonus: number }
  | { type: "win"; moves: number; stars: Stars | null }
  | { type: "lose" };

export interface TapResult {
  state: GameState;
  events: GameEvent[];
}
