import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { campaignKeys, markTutorialMutationOptions, useCampaignQuery } from "@entities/level";
import type { CampaignOverview } from "@entities/level";
import {
  CLIENT_GUIDE_KEYS,
  TUTORIAL_KEYS,
  cardOfServerKey,
  isClientGuideKey,
  serverKeyOfCard,
  useRulesStore,
} from "@entities/rules";
import type { RuleCardId, TutorialKey } from "@entities/rules";

type TutorialEnd = "done" | "skipped";

// The server keeps the keys its levels name and the app's own hints; the device copy only answers until it replies (сервер хранит ключи своих уровней и подсказки приложения; копия на устройстве отвечает, только пока он не ответил).
const serverKeysOf = (overview: CampaignOverview | undefined) =>
  new Set(
    (overview?.worlds ?? [])
      .flatMap(({ levels }) => levels)
      .flatMap(({ tutorial, introduces }) => [
        ...introduces,
        ...(tutorial === undefined ? [] : [tutorial]),
      ]),
  );

export const useSeenGuides = () => {
  const queryClient = useQueryClient();
  const { data: overview } = useCampaignQuery();
  const localCards = useRulesStore((state) => state.seenCards);
  const tutorial = useRulesStore((state) => state.tutorial);
  const hasSeenMovesHint = useRulesStore((state) => state.hasSeenMovesHint);
  const hasSeenHomeTour = useRulesStore((state) => state.hasSeenHomeTour);
  const serverSeen = overview?.tutorials ?? [];
  const serverKeys = serverKeysOf(overview);
  const { mutate } = useMutation({
    ...markTutorialMutationOptions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: campaignKeys.overview() }),
  });

  const send = (key: string) => {
    const isKnown = serverKeys.has(key) || isClientGuideKey(key);
    if (overview !== undefined && isKnown && !serverSeen.includes(key)) {
      mutate({ key, idempotencyKey: uuidv7() });
    }
  };

  const serverCards = serverSeen.flatMap((key) => {
    const id = cardOfServerKey(key);
    return id === null ? [] : [id];
  });

  const isLocallySeen = (key: TutorialKey) =>
    key === TUTORIAL_KEYS.firstLevel
      ? tutorial !== "pending"
      : hasSeenMovesHint || serverSeen.includes(CLIENT_GUIDE_KEYS.movesHint);

  return {
    seenCards: [...new Set([...localCards, ...serverCards])],
    isTutorialSeen: (key: TutorialKey) => serverSeen.includes(key) || isLocallySeen(key),
    markCardsSeen: (ids: readonly RuleCardId[]) => {
      useRulesStore.getState().markSeen(ids);
      ids.forEach((id) => send(serverKeyOfCard(id)));
    },
    markTutorialSeen: (key: TutorialKey, end: TutorialEnd = "done") => {
      const rules = useRulesStore.getState();
      if (key === TUTORIAL_KEYS.movesLimit) {
        rules.markMovesHintSeen();
        send(CLIENT_GUIDE_KEYS.movesHint);
      } else if (end === "skipped") rules.skipTutorial();
      else rules.finishTutorial();
      send(key);
    },
    isHomeTourSeen: hasSeenHomeTour || serverSeen.includes(CLIENT_GUIDE_KEYS.homeTour),
    markHomeTourSeen: () => {
      useRulesStore.getState().markHomeTourSeen();
      send(CLIENT_GUIDE_KEYS.homeTour);
    },
    isArenaEditorSeen: serverSeen.includes(CLIENT_GUIDE_KEYS.arenaEditor),
    markArenaEditorSeen: () => send(CLIENT_GUIDE_KEYS.arenaEditor),
  };
};
