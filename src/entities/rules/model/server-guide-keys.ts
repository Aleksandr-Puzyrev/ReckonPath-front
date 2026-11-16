import type { RuleCardId } from "./rule-cards";
import { isRuleCardId } from "./rules-store";

export const TUTORIAL_KEYS = {
  firstLevel: "tut_first_level",
  movesLimit: "tut_moves_limit",
} as const;

export type TutorialKey = (typeof TUTORIAL_KEYS)[keyof typeof TUTORIAL_KEYS];

// Hints of the app itself, which the server keeps whatever its levels name (подсказки самого приложения: сервер хранит их независимо от уровней).
export const CLIENT_GUIDE_KEYS = {
  flags: "flags",
  distance: "distance",
  homeTour: "home_tour",
  movesHint: "moves_hint",
  arenaEditor: "arena_editor",
} as const;

export type ClientGuideKey = (typeof CLIENT_GUIDE_KEYS)[keyof typeof CLIENT_GUIDE_KEYS];

export const isClientGuideKey = (key: string): key is ClientGuideKey =>
  Object.values<string>(CLIENT_GUIDE_KEYS).includes(key);

// The backend names some elements differently from the client's cards (бэкенд называет часть элементов иначе, чем карточки клиента).
const RENAMED: Partial<Record<RuleCardId, string>> = {
  multi: "multi_target",
  direction: "course",
  hotcold: "hot_cold",
  bombNear: "mine_mark",
};

export const serverKeyOfCard = (id: RuleCardId) => RENAMED[id] ?? id;

export const cardOfServerKey = (key: string): RuleCardId | null => {
  const renamed = Object.entries(RENAMED).find(([, serverKey]) => serverKey === key)?.[0];
  const id = renamed ?? key;
  return isRuleCardId(id) ? id : null;
};
