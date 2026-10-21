import { useState } from "react";

import type { Idx } from "@reckon-path/engine";

import { useSettingsStore } from "@entities/settings";

interface Selection {
  idx: Idx;
  scope: string;
}

// With the confirmation on, the first tap only selects a tile and the second one on it sends the move; a selection lives only within its scope (one turn, no flag mode) (с подтверждением первый тап только выделяет клетку, а второй по ней отправляет ход; выделение живёт только в своей области — один ход без режима флага).
export const useTapConfirm = (scope: string | null) => {
  const isOn = useSettingsStore((state) => state.isPvpTapConfirmOn);
  const [selection, setSelection] = useState<Selection | null>(null);
  const selected = isOn && scope !== null && selection?.scope === scope ? selection.idx : null;

  return {
    selected,
    shouldSend: (idx: Idx) => {
      if (!isOn || scope === null || selected === idx) {
        setSelection(null);
        return true;
      }
      setSelection({ idx, scope });
      return false;
    },
  };
};
