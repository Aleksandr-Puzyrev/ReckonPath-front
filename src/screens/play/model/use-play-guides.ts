import { useState } from "react";

import { toIdx } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { LEVEL_LESSONS, TUTORIAL } from "@reckon-path/content";

import { useGameSessionStore } from "@entities/level";
import {
  RULE_DEMOS,
  isRuleCardId,
  levelCardIds,
  modeCardId,
  unseenCards,
  useRulesStore,
} from "@entities/rules";
import type { RuleCardId } from "@entities/rules";
import { canSkip, highlightOf, isTapAllowed, stepAfterTap } from "@features/tutorial";
import type { TutorialStep } from "@features/tutorial";

export interface OpenCards {
  cards: readonly RuleCardId[];
  index: number;
  isBrowsable: boolean;
}

const CATALOGUE_ORDER = Object.keys(RULE_DEMOS).filter(isRuleCardId);

const lessonsOf = (level: LevelInput) => (LEVEL_LESSONS[level.id] ?? []).filter(isRuleCardId);

export const usePlayGuides = (level: LevelInput | null) => {
  const seenCards = useRulesStore((state) => state.seenCards);
  const tutorialState = useRulesStore((state) => state.tutorial);
  const rules = useRulesStore.getState();
  const [isTutorial] = useState(
    () => level?.id === TUTORIAL.levelId && useRulesStore.getState().tutorial === "pending",
  );
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("tapFirst");
  const [cardQueue, setCardQueue] = useState<RuleCardId[]>(() =>
    level === null || isTutorial
      ? []
      : unseenCards(levelCardIds(level, lessonsOf(level)), useRulesStore.getState().seenCards),
  );
  const [isMovesHintOpen, setIsMovesHintOpen] = useState(
    () => level?.id === TUTORIAL.movesHintLevelId && !useRulesStore.getState().hasSeenMovesHint,
  );
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [openCards, setOpenCards] = useState<OpenCards | null>(null);
  const game = useGameSessionStore((state) => state.game);
  const firstCell = game === null ? null : toIdx(game.board.cols, TUTORIAL.firstCell);
  const isTutorialActive = isTutorial && tutorialState === "pending";

  const metCards = CATALOGUE_ORDER.filter((id) => id === "distance" || seenCards.includes(id));
  const cardsBeforeLevel: OpenCards | null =
    cardQueue.length > 0 ? { cards: cardQueue, index: 0, isBrowsable: false } : null;
  const shownCards = openCards ?? cardsBeforeLevel;
  const isBlocking = shownCards !== null || isRulesOpen || isMovesHintOpen;

  const closeCards = () => {
    if (openCards === null) {
      rules.markSeen(cardQueue);
      setCardQueue([]);
      return;
    }
    rules.markSeen(openCards.cards);
    setOpenCards(null);
  };

  const allowsTap = (cell: Idx) => {
    if (isBlocking) return false;
    if (!isTutorialActive || game === null || firstCell === null) return true;
    return isTapAllowed(tutorialStep, game.board, firstCell, cell);
  };

  return {
    isTutorial: isTutorialActive,
    isTutorialLevel: isTutorial,
    tutorialStep: isTutorialActive ? tutorialStep : null,
    canSkipTutorial: isTutorialActive && canSkip(tutorialStep),
    highlight:
      isTutorialActive && game !== null && firstCell !== null
        ? highlightOf(tutorialStep, game.board, firstCell)
        : null,
    shownCards,
    metCards,
    isRulesOpen,
    isMovesHintOpen,
    isBlocking,
    allowsTap,
    handleTutorialTap: () => setTutorialStep(stepAfterTap(tutorialStep)),
    handleTutorialNext: () => setTutorialStep("tapCloser"),
    handleTutorialSkip: () => rules.skipTutorial(),
    handleTutorialWin: () => {
      if (isTutorialActive) rules.finishTutorial();
    },
    handleMovesHintClose: () => {
      rules.markMovesHintSeen();
      setIsMovesHintOpen(false);
    },
    handleCardsClose: closeCards,
    handleRulesOpen: () => setIsRulesOpen(true),
    handleRulesClose: () => setIsRulesOpen(false),
    handleRuleOpen: (index: number) => setOpenCards({ cards: metCards, index, isBrowsable: true }),
    handleModeInfo: () => {
      if (level !== null) setOpenCards({ cards: [modeCardId(level)], index: 0, isBrowsable: true });
    },
  };
};
