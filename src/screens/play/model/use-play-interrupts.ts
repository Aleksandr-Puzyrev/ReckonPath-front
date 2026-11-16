import { useEffect } from "react";
import { AppState, BackHandler } from "react-native";

export type PlayOverlay =
  "none" | "resume" | "pause" | "restartConfirm" | "win" | "lose" | "declined";

export interface PendingOverlay {
  overlay: PlayOverlay;
  delay: number;
}

interface PlayInterrupts {
  pending: PendingOverlay | null;
  isPlaying: () => boolean;
  setOverlay: (update: (current: PlayOverlay) => PlayOverlay) => void;
  setPending: (pending: PendingOverlay | null) => void;
}

// A result waits for its animation; leaving the app or the back button pauses a game in play (итог ждёт своей анимации; уход из приложения или кнопка «назад» ставят идущую партию на паузу).
export const usePlayInterrupts = ({
  pending,
  isPlaying,
  setOverlay,
  setPending,
}: PlayInterrupts) => {
  useEffect(() => {
    if (pending === null) return;
    const timer = setTimeout(() => {
      setOverlay(() => pending.overlay);
      setPending(null);
    }, pending.delay);
    return () => clearTimeout(timer);
  }, [pending, setOverlay, setPending]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" && isPlaying())
        setOverlay((current) => (current === "none" ? "pause" : current));
    });
    return () => subscription.remove();
  }, [isPlaying, setOverlay]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setOverlay((current) => {
        if (current === "none" && isPlaying()) return "pause";
        if (current === "pause") return "none";
        return current;
      });
      return true;
    });
    return () => subscription.remove();
  }, [isPlaying, setOverlay]);
};
