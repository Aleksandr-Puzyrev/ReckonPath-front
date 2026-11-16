// Exports the bundled campaign (packages/content) in the backend's level format for the admin import (decision 0060 #17).
// Usage: node scripts/export-levels-for-backend.mjs [output.json]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const LEVELS_DIR = join(ROOT, "packages/content/levels");
const OUTPUT = process.argv[2] ?? join(ROOT, "backend-levels.json");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const ru = readJson(join(ROOT, "src/shared/i18n/locales/ru.json")).levels.world;
const en = readJson(join(ROOT, "src/shared/i18n/locales/en.json")).levels.world;

const MODES = { distance: "number", hotcold: "hot_cold", direction: "course" };
const TUTORIALS = { "c-1": "tut_first_level", "c-2": "tut_moves_limit" };

const keyOf = ([row, col]) => `${row}:${col}`;

// The engine lays a bridge over a stream; the backend draws it as its own terrain cell «b».
const terrainOf = (level) => {
  const chars = new Map();
  const mark = (cells, char) => (cells ?? []).forEach((cell) => chars.set(keyOf(cell), char));
  mark(level.streams, "s");
  mark(level.heavy, "h");
  mark(level.rocks, "r");
  mark(level.bridges, "b");
  return Array.from({ length: level.rows }, (_, row) =>
    Array.from({ length: level.cols }, (__, col) => chars.get(keyOf([row, col])) ?? ".").join(""),
  );
};

const backendLevelOf = (level) => ({
  rows: level.rows,
  cols: level.cols,
  terrain: terrainOf(level),
  fences: level.fences ?? [],
  beacons: level.beacons ?? [],
  targets: level.targets,
  bombs: level.bombs ?? [],
  buoys: level.buoys ?? [],
  mode: MODES[level.probeMode],
  fog: level.fog ?? 0,
  order: level.targetOrder ?? false,
  no_bomb_hint: level.bombHint === false,
  limit: level.moveLimit ?? 0,
  stars: level.stars ?? [0, 0],
});

// The same keys and order as the backend's Level.Elements() (internal/game/level.go).
const elementsOf = (level) =>
  [
    [(level.fences ?? []).length > 0, "fence"],
    [(level.streams ?? []).length > 0, "stream"],
    [(level.bridges ?? []).length > 0, "bridge"],
    [(level.heavy ?? []).length > 0, "heavy"],
    [(level.rocks ?? []).length > 0, "rock"],
    [level.targets.length > 1, "multi_target"],
    [(level.bombs ?? []).length > 0, "bomb"],
    [(level.beacons ?? []).length > 0, "beacon"],
    [(level.buoys ?? []).length > 0, "buoy"],
    [(level.fog ?? 0) > 0, "fog"],
    [level.targetOrder === true, "order"],
    [level.probeMode === "hotcold", "hot_cold"],
    [level.probeMode === "direction", "course"],
  ].flatMap(([isPresent, key]) => (isPresent ? [key] : []));

// A level introduces the elements no earlier level had: the client shows their cards before it.
const withIntroduces = (levels) => {
  const met = new Set();
  return levels.map((level) => {
    const introduces = elementsOf(level).filter((key) => !met.has(key));
    introduces.forEach((key) => met.add(key));
    return { level, introduces };
  });
};

const numberOf = (id) => Number(id.slice("c-".length));

const bundled = readdirSync(LEVELS_DIR)
  .filter((file) => /^c-\d+\.json$/.test(file))
  .map((file) => readJson(join(LEVELS_DIR, file)))
  .sort((a, b) => numberOf(a.id) - numberOf(b.id));

const levels = withIntroduces(bundled).map(({ level, introduces }) => ({
  number: numberOf(level.id),
  world: level.world,
  title: { ru: level.title?.ru ?? "", en: level.title?.en ?? "" },
  tutorial: TUTORIALS[level.id] ?? "",
  introduces,
  level: backendLevelOf(level),
}));

const worlds = [...new Set(levels.map((level) => level.world))].map((number) => ({
  number,
  title: { ru: ru.name[number], en: en.name[number] },
  subtitle: { ru: ru.subtitle[number], en: en.subtitle[number] },
  first_level: Math.min(...levels.filter((level) => level.world === number).map((l) => l.number)),
  last_level: Math.max(...levels.filter((level) => level.world === number).map((l) => l.number)),
}));

writeFileSync(OUTPUT, `${JSON.stringify({ worlds, levels }, null, 2)}\n`);
console.info(`${levels.length} levels in ${worlds.length} worlds → ${OUTPUT}`);
