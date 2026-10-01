import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync,
  selectionAsync,
} from "expo-haptics";

export type HapticKind =
  "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error";

const THROTTLE_MS = 80;

const PLAYERS: Record<HapticKind, () => Promise<void>> = {
  light: () => impactAsync(ImpactFeedbackStyle.Light),
  medium: () => impactAsync(ImpactFeedbackStyle.Medium),
  heavy: () => impactAsync(ImpactFeedbackStyle.Heavy),
  selection: () => selectionAsync(),
  success: () => notificationAsync(NotificationFeedbackType.Success),
  warning: () => notificationAsync(NotificationFeedbackType.Warning),
  error: () => notificationAsync(NotificationFeedbackType.Error),
};

let lastPlayedAt = Number.NEGATIVE_INFINITY;

// TODO: respect the vibration setting once the settings store exists
export const haptic = (...kinds: HapticKind[]) => {
  const now = Date.now();
  if (now - lastPlayedAt < THROTTLE_MS) return;
  lastPlayedAt = now;
  kinds.forEach((kind) => void PLAYERS[kind]());
};
