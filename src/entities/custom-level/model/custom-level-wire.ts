import { levelFromBackend, levelSchema, levelToBackend } from "@reckon-path/engine";

import { levelIdOf, levelOfDraft } from "./custom-level-of";
import type {
  CustomDraft,
  CustomLevelRequest,
  CustomLevelView,
  SavedCustomLevel,
} from "./custom-level-type";

// The level body comes from the server, so it is checked by the engine schema before the engine sees it (тело уровня приходит с сервера, поэтому его проверяет схема движка до того, как его увидит движок).
export const savedCustomLevelOf = (view: CustomLevelView): SavedCustomLevel | null => {
  const parsed = levelSchema.safeParse(levelFromBackend(view.level, levelIdOf(view.id)));
  if (!parsed.success) return null;
  return { id: view.id, title: view.title, level: parsed.data, updatedAt: view.updatedAt };
};

// Custom levels have no stars, but the backend wants 1 ≤ 3★ ≤ 2★ ≤ limit when a limit is set (у своих уровней нет звёзд, но бэкенд требует 1 ≤ 3★ ≤ 2★ ≤ лимит, когда лимит задан).
export const customLevelRequestOf = (
  draft: CustomDraft,
  norm: number | null,
): CustomLevelRequest => {
  const input = levelOfDraft(draft, null, norm);
  const limit = input.moveLimit ?? null;
  return {
    title: draft.title,
    level: levelToBackend({ ...input, stars: limit === null ? null : [limit, limit] }),
  };
};
