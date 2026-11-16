import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";

import { useSeenGuides } from "@features/mark-guides-seen";
import { arenaKeys, markRulesSeenMutationOptions, useArenaQuery } from "@entities/arena";
import { TUTORIAL_MAP_ID } from "@entities/arena-map";
import { unseenCards, useRulesStore } from "@entities/rules";
import type { RuleCardId } from "@entities/rules";

import { ARENA_ELEMENT_CARDS, ARENA_INTRO_CARDS } from "./arena-intro-cards";

export const useArenaOnboarding = (onError: () => void) => {
  const queryClient = useQueryClient();
  const arena = useArenaQuery();
  const format = arena.data?.league.format;
  const seenCards = useRulesStore((state) => state.seenCards);
  const markSeen = useRulesStore((state) => state.markSeen);
  const [index, setIndex] = useState(0);
  const [elements, setElements] = useState<readonly RuleCardId[] | null>(null);
  const seen = useSeenGuides();
  // The editor tutorial ends with a saved map, so a player who has passed it elsewhere is not sent to it again (обучение редактора заканчивается сохранённой картой, поэтому прошедший его на другом устройстве туда не отправляется).
  const hasMap = arena.data?.activeMap !== undefined || seen.isArenaEditorSeen;

  // The rules are stored on the server; a player without a map goes on to the editor tutorial (правила запоминает сервер; игрок без карты переходит к обучению редактора).
  const rulesSeen = useMutation({
    ...markRulesSeenMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: arenaKeys.all });
      if (hasMap) router.back();
      else router.replace({ pathname: "/arena/map/[id]", params: { id: TUTORIAL_MAP_ID } });
    },
    onError,
  });

  // The onboarding cannot be left until the rules are seen (онбординг нельзя покинуть, пока правила не просмотрены).
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, []);

  const finish = () => {
    if (!rulesSeen.isPending) rulesSeen.mutate();
  };

  const showElements = () => {
    const cards = unseenCards(ARENA_ELEMENT_CARDS, seenCards);
    if (cards.length === 0) finish();
    else setElements(cards);
  };

  return {
    format,
    isFailed: arena.isError,
    handleRetry: () => void arena.refetch(),
    handleLeave: () => router.back(),
    card: ARENA_INTRO_CARDS[index],
    index,
    elements,
    isStarting: rulesSeen.isPending,
    handleNext: () => {
      if (index < ARENA_INTRO_CARDS.length - 1) setIndex(index + 1);
      else showElements();
    },
    handleElementsClose: () => {
      markSeen(elements ?? []);
      setElements(null);
      finish();
    },
    handleSkip: finish,
  };
};
