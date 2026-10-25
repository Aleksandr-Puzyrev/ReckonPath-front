import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { decodeLevel } from "@reckon-path/engine";

export const usePlayCode = () => {
  const { c: linked } = useLocalSearchParams<{ c?: string }>();
  const [code, setCode] = useState(linked ?? "");
  const trimmed = code.trim();
  const decoded = trimmed === "" ? null : decodeLevel(trimmed);

  return {
    code,
    decoded,
    handleChange: setCode,
    // The clipboard is read only on «Вставить»: iOS warns about every read (буфер читается только по «Вставить»: iOS предупреждает о каждом чтении).
    handlePaste: async () => setCode(await Clipboard.getStringAsync()),
    handlePlay: () => router.push({ pathname: "/play/code", params: { c: trimmed } }),
    handleClose: () => router.back(),
  };
};
