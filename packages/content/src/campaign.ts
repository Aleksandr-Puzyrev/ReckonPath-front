import { levelSchema } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import level1 from "../levels/c-1.json";
import level2 from "../levels/c-2.json";
import level3 from "../levels/c-3.json";
import level4 from "../levels/c-4.json";
import level5 from "../levels/c-5.json";
import level6 from "../levels/c-6.json";
import level7 from "../levels/c-7.json";
import level8 from "../levels/c-8.json";
import level9 from "../levels/c-9.json";
import level10 from "../levels/c-10.json";
import level11 from "../levels/c-11.json";
import level12 from "../levels/c-12.json";
import level13 from "../levels/c-13.json";
import level14 from "../levels/c-14.json";
import level15 from "../levels/c-15.json";
import level16 from "../levels/c-16.json";
import level17 from "../levels/c-17.json";
import level18 from "../levels/c-18.json";
import level19 from "../levels/c-19.json";
import level20 from "../levels/c-20.json";
import level21 from "../levels/c-21.json";
import level22 from "../levels/c-22.json";
import level23 from "../levels/c-23.json";
import level24 from "../levels/c-24.json";

const SOURCES: readonly unknown[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
  level11,
  level12,
  level13,
  level14,
  level15,
  level16,
  level17,
  level18,
  level19,
  level20,
  level21,
  level22,
  level23,
  level24,
];

// Parsed at the boundary so a broken file fails loudly instead of reaching the engine (разбор на границе: битый файл падает сразу, а не доходит до движка).
export const CAMPAIGN: readonly LevelInput[] = SOURCES.map((source) => levelSchema.parse(source));
