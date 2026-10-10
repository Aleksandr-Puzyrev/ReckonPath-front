import { CAMPAIGN_LEVELS } from "./campaign-levels";

const PREVIEW_ROWS = 5;

// A 5×5 board to show a skin on, as in the design previews (поле 5×5, чтобы показать скин, как в превью дизайна).
export const PREVIEW_LEVEL = CAMPAIGN_LEVELS.find(
  ({ level }) => level.rows === PREVIEW_ROWS,
)?.level;
