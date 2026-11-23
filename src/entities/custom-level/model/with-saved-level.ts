import type { CustomLevels, SavedCustomLevel } from "./custom-level-type";

// The list is newest first, as the server keeps it (список идёт от новых к старым, как на сервере).
export const withSavedLevel = (list: CustomLevels, saved: SavedCustomLevel): CustomLevels => ({
  ...list,
  levels: [saved, ...list.levels.filter(({ id }) => id !== saved.id)],
});
