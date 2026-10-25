import { mapKeysDeep } from "./map-keys-deep";

// Only plain camelCase words are renamed; keys such as "c-27" or "arena.maxTurns" are data and stay (переименовываются только простые camelCase-слова; ключи вроде "c-27" или "arena.maxTurns" — данные и не меняются).
const CAMEL_KEY = /^[a-z][a-z0-9]*([A-Z][a-z0-9]*)+$/;

const snakeKey = (key: string) =>
  CAMEL_KEY.test(key) ? key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) : key;

export const toSnakeKeys = (value: unknown) => mapKeysDeep(value, snakeKey);
