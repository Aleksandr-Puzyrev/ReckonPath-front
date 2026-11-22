import type { TFunction } from "i18next";

interface ArenaAccess {
  isUnlocked: boolean;
  unlockLevel: number;
  isBanned: boolean;
}

// The reason a challenge cannot be sent is the same text as its toast (причина, по которой вызов нельзя отправить, — тот же текст, что и в тосте).
export const lockReasonOf = ({ isUnlocked, unlockLevel, isBanned }: ArenaAccess, t: TFunction) => {
  if (isBanned) return t("errors.arena_banned");
  return isUnlocked ? null : t("errors.arena_locked", { level: unlockLevel });
};
