const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const mapKeysDeep = (value: unknown, mapKey: (key: string) => string): unknown => {
  if (Array.isArray(value)) return value.map((item) => mapKeysDeep(item, mapKey));
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [mapKey(key), mapKeysDeep(item, mapKey)]),
  );
};
