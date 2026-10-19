import { useEffect, useState } from "react";

import { runBot } from "@entities/arena-map";
import type { BotRun, PvpMap } from "@entities/arena-map";

const CHECK_MS = 5000;

interface Check {
  run: BotRun;
  step: number;
}

export const useBotCheck = () => {
  const [check, setCheck] = useState<Check | null>(null);
  const run = check?.run ?? null;

  useEffect(() => {
    if (run === null) return undefined;
    const timer = setInterval(
      () =>
        setCheck((current) => {
          if (current === null || current.step >= current.run.taps.length) return current;
          return { ...current, step: current.step + 1 };
        }),
      CHECK_MS / Math.max(1, run.taps.length),
    );
    return () => clearInterval(timer);
  }, [run]);

  return {
    taps: check === null ? [] : check.run.taps.slice(0, check.step),
    check,
    isDone: check !== null && check.step >= check.run.taps.length,
    start: (map: PvpMap) => setCheck({ run: runBot(map), step: 0 }),
    stop: () => setCheck(null),
  };
};
