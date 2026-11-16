import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { toIdx } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import { checkArenaMapMutationOptions } from "@entities/arena-map";
import type { MapProblem, PvpMap } from "@entities/arena-map";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

const CHECK_MS = 5000;

interface Check {
  taps: Idx[];
  moves: number;
  found: number;
  problem: MapProblem | null;
  step: number;
}

const isSame = ([a, b]: readonly number[], [c, d]: readonly number[]) => a === c && b === d;

// «Проверить» asks the server; its bot taps are then replayed on the board one by one («Проверить» спрашивает сервер; тапы его бота затем по одному проигрываются на поле).
export const useBotCheck = (onError: (messageKey: ErrorMessageKey) => void) => {
  const [check, setCheck] = useState<Check | null>(null);
  const request = useMutation({
    ...checkArenaMapMutationOptions(),
    onError: (error) => onError(errorMessageKey(error)),
  });
  const taps = check?.taps ?? null;

  useEffect(() => {
    if (taps === null) return undefined;
    const timer = setInterval(
      () =>
        setCheck((current) => {
          if (current === null || current.step >= current.taps.length) return current;
          return { ...current, step: current.step + 1 };
        }),
      CHECK_MS / Math.max(1, taps.length),
    );
    return () => clearInterval(timer);
  }, [taps]);

  return {
    taps: check === null ? [] : check.taps.slice(0, check.step),
    check,
    isPending: request.isPending,
    isDone: check !== null && check.step >= check.taps.length,
    start: (map: PvpMap) =>
      request.mutate(map, {
        onSuccess: ({ problems = [], bot }) => {
          const cells = bot?.taps ?? [];
          setCheck({
            taps: cells.map(([row = 0, col = 0]) => toIdx(map.cols, [row, col])),
            moves: bot?.moves ?? 0,
            found: map.targets.filter((target) => cells.some((cell) => isSame(cell, target)))
              .length,
            problem: problems[0] ?? null,
            step: 0,
          });
        },
      }),
    stop: () => setCheck(null),
  };
};
