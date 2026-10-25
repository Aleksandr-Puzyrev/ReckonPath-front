import { decodeLevel, encodeLevel } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import {
  checkCustomLevel,
  levelOfDraft,
  NEW_LEVEL_ID,
  useLevelEditorStore,
} from "@entities/custom-level";

export interface TryoutLevel {
  level: LevelInput;
  isAuthor: boolean;
  challenge: number | null;
  levelCode: string;
}

// The author plays the editor's draft; a player plays a level from its code (автор играет черновик редактора, игрок — уровень из кода).
export const tryoutLevelOf = (code: string | undefined): TryoutLevel | null => {
  if (code !== undefined) {
    const decoded = decodeLevel(code);
    if (!decoded.ok) return null;
    return {
      level: decoded.level,
      isAuthor: false,
      challenge: decoded.challenge,
      levelCode: encodeLevel(decoded.level),
    };
  }
  const { session } = useLevelEditorStore.getState();
  if (session === null) return null;
  const savedId = session.levelId === NEW_LEVEL_ID ? null : session.levelId;
  const status = checkCustomLevel(session.draft, savedId);
  if (status.kind !== "valid") return null;
  const level = levelOfDraft(session.draft, savedId, status.norm);
  return { level, isAuthor: true, challenge: null, levelCode: encodeLevel(level) };
};
