import { router, useSegments } from "expo-router";
import { useEffect, useRef } from "react";

import { hasArenaBan } from "@features/arena-access";
import { useChallengeSync } from "@entities/challenge";
import { matchSession, useMatchStore } from "@entities/match";
import { useMeQuery } from "@entities/wallet";
import { HAS_ARENA_SERVER } from "@shared/config";

// The search screen and the match screen open a found match themselves (экран поиска и экран матча сами открывают найденный матч).
const MATCH_SCREENS: readonly string[] = ["match", "search"];

// Mounted while signed in: the arena socket stays open app-wide for challenges, and a friendly match from an accepted challenge opens from any screen (decision 0062 #7) (смонтирован, пока игрок вошёл: сокет арены открыт во всём приложении ради вызовов, а дружеский матч из принятого вызова открывается с любого экрана).
const ArenaSocketHost = () => {
  const { data: me } = useMeQuery();
  const [section, screen] = useSegments();
  const isConnected = HAS_ARENA_SERVER && me !== undefined && !hasArenaBan(me);
  const friendlyId = useMatchStore(({ view }) =>
    view?.friendly === true && view.status !== "done" ? view.id : null,
  );
  const isOnMatchScreen =
    section === "arena" && screen !== undefined && MATCH_SCREENS.includes(screen);
  const openedId = useRef<string | null>(null);

  useChallengeSync(isConnected);

  useEffect(() => (isConnected ? matchSession.retain() : undefined), [isConnected]);

  // Signing out unmounts the host, so the next account never sees this one's match (выход из аккаунта размонтирует хост, и следующий аккаунт не видит матч этого).
  useEffect(() => () => useMatchStore.getState().reset(), []);

  useEffect(() => {
    if (friendlyId === null || isOnMatchScreen || openedId.current === friendlyId) return;
    openedId.current = friendlyId;
    router.push({ pathname: "/arena/match/[id]", params: { id: friendlyId } });
  }, [friendlyId, isOnMatchScreen]);

  return null;
};

export default ArenaSocketHost;
