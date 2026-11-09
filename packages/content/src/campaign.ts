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
import level25 from "../levels/c-25.json";
import level26 from "../levels/c-26.json";
import level27 from "../levels/c-27.json";
import level28 from "../levels/c-28.json";
import level29 from "../levels/c-29.json";
import level30 from "../levels/c-30.json";
import level31 from "../levels/c-31.json";
import level32 from "../levels/c-32.json";
import level33 from "../levels/c-33.json";
import level34 from "../levels/c-34.json";
import level35 from "../levels/c-35.json";
import level36 from "../levels/c-36.json";
import level37 from "../levels/c-37.json";
import level38 from "../levels/c-38.json";
import level39 from "../levels/c-39.json";
import level40 from "../levels/c-40.json";
import level41 from "../levels/c-41.json";
import level42 from "../levels/c-42.json";
import level43 from "../levels/c-43.json";
import level44 from "../levels/c-44.json";
import level45 from "../levels/c-45.json";
import level46 from "../levels/c-46.json";
import level47 from "../levels/c-47.json";
import level48 from "../levels/c-48.json";
import level49 from "../levels/c-49.json";
import level50 from "../levels/c-50.json";
import level51 from "../levels/c-51.json";
import level52 from "../levels/c-52.json";
import level53 from "../levels/c-53.json";
import level54 from "../levels/c-54.json";
import level55 from "../levels/c-55.json";
import level56 from "../levels/c-56.json";
import level57 from "../levels/c-57.json";
import level58 from "../levels/c-58.json";
import level59 from "../levels/c-59.json";
import level60 from "../levels/c-60.json";
import level61 from "../levels/c-61.json";
import level62 from "../levels/c-62.json";
import level63 from "../levels/c-63.json";
import level64 from "../levels/c-64.json";
import level65 from "../levels/c-65.json";
import level66 from "../levels/c-66.json";
import level67 from "../levels/c-67.json";
import level68 from "../levels/c-68.json";
import level69 from "../levels/c-69.json";
import level70 from "../levels/c-70.json";
import level71 from "../levels/c-71.json";
import level72 from "../levels/c-72.json";
import level73 from "../levels/c-73.json";
import level74 from "../levels/c-74.json";
import level75 from "../levels/c-75.json";
import level76 from "../levels/c-76.json";
import level77 from "../levels/c-77.json";
import level78 from "../levels/c-78.json";
import level79 from "../levels/c-79.json";
import level80 from "../levels/c-80.json";
import level81 from "../levels/c-81.json";
import level82 from "../levels/c-82.json";
import level83 from "../levels/c-83.json";
import level84 from "../levels/c-84.json";
import level85 from "../levels/c-85.json";
import level86 from "../levels/c-86.json";
import level87 from "../levels/c-87.json";
import level88 from "../levels/c-88.json";
import level89 from "../levels/c-89.json";
import level90 from "../levels/c-90.json";
import level91 from "../levels/c-91.json";
import level92 from "../levels/c-92.json";
import level93 from "../levels/c-93.json";
import level94 from "../levels/c-94.json";
import level95 from "../levels/c-95.json";
import level96 from "../levels/c-96.json";
import level97 from "../levels/c-97.json";
import level98 from "../levels/c-98.json";
import level99 from "../levels/c-99.json";
import level100 from "../levels/c-100.json";

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
  level25,
  level26,
  level27,
  level28,
  level29,
  level30,
  level31,
  level32,
  level33,
  level34,
  level35,
  level36,
  level37,
  level38,
  level39,
  level40,
  level41,
  level42,
  level43,
  level44,
  level45,
  level46,
  level47,
  level48,
  level49,
  level50,
  level51,
  level52,
  level53,
  level54,
  level55,
  level56,
  level57,
  level58,
  level59,
  level60,
  level61,
  level62,
  level63,
  level64,
  level65,
  level66,
  level67,
  level68,
  level69,
  level70,
  level71,
  level72,
  level73,
  level74,
  level75,
  level76,
  level77,
  level78,
  level79,
  level80,
  level81,
  level82,
  level83,
  level84,
  level85,
  level86,
  level87,
  level88,
  level89,
  level90,
  level91,
  level92,
  level93,
  level94,
  level95,
  level96,
  level97,
  level98,
  level99,
  level100,
];

// Parsed at the boundary so a broken file fails loudly instead of reaching the engine (разбор на границе: битый файл падает сразу, а не доходит до движка).
export const CAMPAIGN: readonly LevelInput[] = SOURCES.map((source) => levelSchema.parse(source));
