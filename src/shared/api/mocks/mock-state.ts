import { keyValueStorage } from "@shared/storage";

const KEY_PREFIX = "dev-mock-server.";

// The mock server keeps its data between launches, like a real one; otherwise every reload would reconcile progress to nothing (мок-сервер хранит данные между запусками, как настоящий; иначе каждый перезапуск сверял бы прогресс с пустотой).
export const loadMockState = <T>(name: string, fallback: T): T => {
  const saved = keyValueStorage.getItem(`${KEY_PREFIX}${name}`);
  if (saved === null) return fallback;
  try {
    // Written only by saveMockState with the same name, so the shape matches (пишется только saveMockState с тем же именем, поэтому форма совпадает).
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
};

export const saveMockState = (name: string, value: unknown) =>
  keyValueStorage.setItem(`${KEY_PREFIX}${name}`, JSON.stringify(value));

export const clearMockState = (name: string) => keyValueStorage.removeItem(`${KEY_PREFIX}${name}`);
