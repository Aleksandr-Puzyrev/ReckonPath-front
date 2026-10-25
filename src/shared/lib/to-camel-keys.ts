import { mapKeysDeep } from "./map-keys-deep";

// Only plain snake_case words are renamed; keys such as "c-27" or "arena.maxTurns" are data and stay (переименовываются только простые snake_case-слова; ключи вроде "c-27" или "arena.maxTurns" — данные и не меняются).
const SNAKE_KEY = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/;

const camelKey = (key: string) =>
  SNAKE_KEY.test(key)
    ? key.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase())
    : key;

export const toCamelKeys = (value: unknown) => mapKeysDeep(value, camelKey);
