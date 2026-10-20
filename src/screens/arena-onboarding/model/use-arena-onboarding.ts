import { router } from "expo-router";
import { useEffect, useEffectEvent, useState } from "react";
import { BackHandler } from "react-native";

import { useArenaQuery } from "@entities/arena";
import { TUTORIAL_MAP_ID } from "@entities/arena-map";
import { matchSession, useMatchStore } from "@entities/match";
import type { MatchPhase } from "@entities/match";
import { unseenCards, useRulesStore } from "@entities/rules";
import type { RuleCardId } from "@entities/rules";

import { ARENA_ELEMENT_CARDS, ARENA_INTRO_CARDS } from "./arena-intro-cards";

const TURN_PHASES: ReadonlySet<MatchPhase> = new Set(["myTurn", "opponentTurn", "finalTurn"]);
const FAILED_PHASES: ReadonlySet<MatchPhase> = new Set(["idle", "lost"]);

export const useArenaOnboarding = (onError: () => void) => {
  const arena = useArenaQuery();
  const format = arena.data?.format;
  const seenCards = useRulesStore((state) => state.seenCards);
  const markSeen = useRulesStore((state) => state.markSeen);
  const isTraining = useMatchStore((state) => state.isTraining);
  const phase = useMatchStore((state) => state.phase);
  const matchId = useMatchStore((state) => state.matchId);
  const [index, setIndex] = useState(0);
  const [elements, setElements] = useState<readonly RuleCardId[] | null>(null);
  const isStarted = isTraining && matchId !== null && TURN_PHASES.has(phase);
  const isFailed = isTraining && FAILED_PHASES.has(phase);

  const handleFailed = useEffectEvent(() => {
    matchSession.leave();
    onError();
  });

  useEffect(() => {
    if (isStarted) router.replace({ pathname: "/arena/match/[id]", params: { id: matchId } });
  }, [isStarted, matchId]);

  useEffect(() => {
    if (isFailed) handleFailed();
  }, [isFailed]);

  // The onboarding cannot be left until the map is built (онбординг нельзя покинуть, пока не собрана карта).
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, []);

  const startTraining = () => {
    if (format !== undefined) matchSession.training(format.size);
  };

  const showElements = () => {
    const cards = unseenCards(ARENA_ELEMENT_CARDS, seenCards);
    if (cards.length === 0) startTraining();
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
    isStarting: isTraining,
    handleNext: () => {
      if (index < ARENA_INTRO_CARDS.length - 1) setIndex(index + 1);
      else showElements();
    },
    handleElementsClose: () => {
      markSeen(elements ?? []);
      setElements(null);
      startTraining();
    },
    handleSkip: () =>
      router.replace({ pathname: "/arena/map/[id]", params: { id: TUTORIAL_MAP_ID } }),
  };
};
