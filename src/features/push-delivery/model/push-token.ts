export const isFcmToken = (value: unknown): value is string =>
  typeof value === "string" && value.length >= 16 && value.length <= 4096;
