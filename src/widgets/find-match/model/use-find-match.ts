import { router } from "expo-router";
import { useEffect, useEffectEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Arena } from "@entities/arena";
import { nextMapNumber } from "@entities/arena-map";
import type { ArenaMap } from "@entities/arena-map";
import { matchSession } from "@entities/match";
import { useAccountStore } from "@entities/session";
import { useRandomArenaMap } from "@features/random-arena-map";
import { useSaveArenaMap } from "@features/save-arena-map";
import type { ErrorMessageKey } from "@shared/api";

interface FindMatchOptions {
  arena: Arena | undefined;
  maps: readonly ArenaMap[];
  onError: (messageKey: ErrorMessageKey) => void;
  isReplacing: boolean;
}

export const useFindMatch = ({ arena, maps, onError, isReplacing }: FindMatchOptions) => {
  const { t } = useTranslation();
  const [isNoMapOpen, setIsNoMapOpen] = useState(false);
  const format = arena?.format.size ?? 0;
  const activeMapId = arena?.activeMapId ?? null;

  const search = (mapId: string) => {
    matchSession.search(format, mapId);
    if (isReplacing) router.replace("/arena/search");
    else router.push("/arena/search");
  };

  const begin = () => {
    if (activeMapId === null) {
      setIsNoMapOpen(true);
      return;
    }
    search(activeMapId);
  };

  const saving = useSaveArenaMap({
    onSaved: () => undefined,
    // A random map starts the search once the server has made it active (случайная карта запускает поиск, когда сервер сделал её активной).
    onActivated: (mapId) => {
      setIsNoMapOpen(false);
      search(mapId);
    },
    onDraft: () => onError("errors.MAP_INVALID"),
    onMapsLimit: () => onError("errors.LIMIT_REACHED"),
    onError,
  });
  const random = useRandomArenaMap({
    onMap: (map) => {
      const nameOf = (n: number) => t("map.defaultName", { n });
      const name = nameOf(
        nextMapNumber(
          maps.map((saved) => saved.name),
          nameOf,
        ),
      );
      saving.save(null, { name, format, map });
    },
    onError,
  });

  const continueAfterOffer = useEffectEvent(begin);

  // «Позже» on the link sheet goes on to the search (ARN-02) («Позже» в листе привязки продолжает поиск).
  useEffect(
    () =>
      useAccountStore.subscribe((account, previous) => {
        if (account.declined !== previous.declined && account.declined?.offer === "arena") {
          continueAfterOffer();
        }
      }),
    [],
  );

  return {
    isNoMapOpen,
    isRandomPending: random.isPending || saving.isPending,
    handleFight: () => {
      if (useAccountStore.getState().requestArenaOffer()) return;
      begin();
    },
    handleBuildMap: () => {
      setIsNoMapOpen(false);
      router.push({ pathname: "/arena/map/[id]", params: { id: "new" } });
    },
    handleRandomMap: () => random.requestRandom(format),
    handleNoMapClose: () => setIsNoMapOpen(false),
  };
};
