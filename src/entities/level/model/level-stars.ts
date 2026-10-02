import { stars } from "@reckon-path/engine";
import type { GameState, Stars } from "@reckon-path/engine";

const FULL_STARS: Stars = 3;

// A campaign level without star thresholds is the tutorial, whose result is always 3★ (уровень кампании без порогов — обучение, его итог всегда 3★).
export const levelStarsOf = (game: GameState): Stars => stars(game) ?? FULL_STARS;
