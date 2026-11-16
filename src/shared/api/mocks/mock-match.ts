import type { components } from "../generated/schema";

import { MOCK_RANDOM_LEVEL } from "./arena-map-handlers";
import { MOCK_FORMAT, MOCK_LEAGUE } from "./mock-arena";

type Schemas = components["schemas"];
type MatchView = Schemas["MatchView"];
type PlayerView = Schemas["PlayerView"];
type BoardView = Schemas["BoardView"];
type GameLevel = Schemas["GameLevel"];

const SECOND_MS = 1000;
const PREPARE_SECONDS = 60;
const VS_SECONDS = 3;
const MAP_GAME_SECONDS = 300;

const player = (id: string, name: string): PlayerView => ({
  id,
  name,
  trophies: 120,
  league: { league: MOCK_LEAGUE.league, title: MOCK_LEAGUE.title, division: "III", min: 0 },
  look: {},
  skins: {},
  ready: false,
  found: 0,
  moves: 0,
  skips: 0,
  timeouts: 0,
});

export const mockBoardOf = (level: GameLevel, isOpen: boolean): BoardView => ({
  rows: level.rows,
  cols: level.cols,
  terrain: level.terrain,
  fences: level.fences ?? [],
  targets: level.targets.length,
  bombs: level.bombs?.length ?? 0,
  revealed: [],
  taps: [],
  ...(isOpen ? { secrets: { targets: level.targets, bombs: level.bombs ?? [], buoys: [] } } : {}),
});

const at = (now: number, seconds: number) => new Date(now + seconds * SECOND_MS).toISOString();

export const matchViewMock = (overrides: Partial<MatchView> = {}, now = Date.now()): MatchView => ({
  id: "match-live",
  kind: "duel",
  status: "prepare",
  seq: 1,
  serverTime: new Date(now).toISOString(),
  format: MOCK_FORMAT,
  me: player("me", "test"),
  rival: player("rival", "Kira"),
  deadline: at(now, PREPARE_SECONDS),
  myMap: mockBoardOf(MOCK_RANDOM_LEVEL, true),
  surrenderLoss: 12,
  log: [],
  ...overrides,
});

export const playingMatchMock = (overrides: Partial<MatchView> = {}, now = Date.now()) =>
  matchViewMock(
    {
      status: "play",
      turn: "me",
      first: "me",
      final: false,
      startsAt: at(now, -VS_SECONDS),
      deadline: at(now, MOCK_FORMAT.moveSeconds),
      rivalMap: mockBoardOf(MOCK_RANDOM_LEVEL, false),
      ...overrides,
    },
    now,
  );

export const mapMatchMock = (overrides: Partial<MatchView> = {}, now = Date.now()) =>
  playingMatchMock(
    {
      id: "match-map",
      kind: "map",
      turn: undefined,
      first: undefined,
      norm: 6,
      deadline: at(now, MAP_GAME_SECONDS),
      myMap: undefined,
      ...overrides,
    },
    now,
  );

export const doneMatchMock = (overrides: Partial<MatchView> = {}, now = Date.now()) =>
  playingMatchMock(
    {
      id: "match-done",
      status: "done",
      seq: 20,
      turn: undefined,
      myMap: mockBoardOf(MOCK_RANDOM_LEVEL, true),
      rivalMap: mockBoardOf(MOCK_RANDOM_LEVEL, true),
      result: {
        outcome: "win",
        reason: "targets",
        trophies: 16,
        trophyNow: 136,
        league: { league: "bronze", title: "Bronze", division: "III", min: 0 },
        next: { league: "bronze", title: "Bronze", division: "II", min: 200 },
        coins: 40,
        gems: 3,
        xp: 10,
        rp: 10,
      },
      ...overrides,
    },
    now,
  );
