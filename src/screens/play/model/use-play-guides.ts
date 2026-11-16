import { useState } from "react";

import type { Idx } from "@reckon-path/engine";

import type { PlayView } from "@entities/level";
import { RULE_DEMOS, isRuleCardId, modeCardId, unseenCards } from "@entities/rules";
import type { RuleCardId, TutorialKey } from "@entities/rules";
import { useSeenGuides } from "@features/mark-guides-seen";
import {
  canSkip,
  highlightOf,
  isTapAllowed,
  stepAfterTap,
  tutorialFirstCell,
} from "@features/tutorial";
import type { TutorialStep } from "@features/tutorial";

import { bombCoachHighlight } from "./bomb-coach-highlight";

export interface OpenCards {
  cards: readonly RuleCardId[];
  index: number;
  isBrowsable: boolean;
}

export interface GuideSource {
  view: PlayView | null;
  cardsBefore: readonly RuleCardId[];
  tutorialKey: TutorialKey | null;
  movesHintKey: TutorialKey | null;
}

const CATALOGUE_ORDER = Object.keys(RULE_DEMOS).filter(isRuleCardId);

export const usePlayGuides = ({ view, cardsBefore, tutorialKey, movesHintKey }: GuideSource) => {
  const seen = useSeenGuides();
  const { seenCards } = seen;
  const [isTutorial] = useState(() => tutorialKey !== null && !seen.isTutorialSeen(tutorialKey));
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("tapFirst");
  const [cardQueue, setCardQueue] = useState<RuleCardId[]>(() =>
    isTutorial ? [] : unseenCards(cardsBefore, seenCards),
  );
  const [isMovesHintOpen, setIsMovesHintOpen] = useState(
    () => movesHintKey !== null && !seen.isTutorialSeen(movesHintKey),
  );
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [openCards, setOpenCards] = useState<OpenCards | null>(null);
  const firstCell = view === null ? null : tutorialFirstCell(view.board);
  const isTutorialActive = isTutorial && tutorialKey !== null && !seen.isTutorialSeen(tutorialKey);

  const bombHighlight = seenCards.includes("bombNear") ? null : bombCoachHighlight(view);
  const isBombCoachOpen = bombHighlight !== null && !isTutorialActive;

  const metCards = CATALOGUE_ORDER.filter(
    (id) =>
      id === "distance" ||
      (seenCards.includes(id) && !(id === "bombNear" && view?.rules.bombHint === false)),
  );
  const cardsBeforeLevel: OpenCards | null =
    cardQueue.length > 0 ? { cards: cardQueue, index: 0, isBrowsable: false } : null;
  const shownCards = openCards ?? cardsBeforeLevel;
  const isBlocking = shownCards !== null || isRulesOpen || isMovesHintOpen || isBombCoachOpen;

  const closeCards = () => {
    if (openCards === null) {
      seen.markCardsSeen(cardQueue);
      setCardQueue([]);
      return;
    }
    seen.markCardsSeen(openCards.cards);
    setOpenCards(null);
  };

  const allowsTap = (cell: Idx) => {
    if (isBlocking) return false;
    if (!isTutorialActive || view === null || firstCell === null) return true;
    return isTapAllowed(tutorialStep, view.board, firstCell, cell);
  };

  return {
    isTutorial: isTutorialActive,
    isTutorialLevel: isTutorial,
    tutorialStep: isTutorialActive ? tutorialStep : null,
    canSkipTutorial: isTutorialActive && canSkip(tutorialStep),
    highlight:
      isTutorialActive && view !== null && firstCell !== null
        ? highlightOf(tutorialStep, view.board, firstCell)
        : bombHighlight,
    shownCards,
    metCards,
    isRulesOpen,
    isMovesHintOpen,
    isBombCoachOpen,
    isBlocking,
    allowsTap,
    handleTutorialTap: () => setTutorialStep(stepAfterTap(tutorialStep)),
    handleTutorialNext: () => setTutorialStep("tapCloser"),
    handleTutorialSkip: () => {
      if (tutorialKey !== null) seen.markTutorialSeen(tutorialKey, "skipped");
    },
    handleTutorialWin: () => {
      if (isTutorialActive) seen.markTutorialSeen(tutorialKey, "done");
    },
    handleMovesHintClose: () => {
      if (movesHintKey !== null) seen.markTutorialSeen(movesHintKey);
      setIsMovesHintOpen(false);
    },
    handleBombCoachClose: () => seen.markCardsSeen(["bombNear"]),
    handleCardsClose: closeCards,
    handleRulesOpen: () => setIsRulesOpen(true),
    handleRulesClose: () => setIsRulesOpen(false),
    handleRuleOpen: (index: number) => setOpenCards({ cards: metCards, index, isBrowsable: true }),
    handleModeInfo: () =>
      setOpenCards({
        cards: [modeCardId({ probeMode: view?.rules.probeMode ?? "distance" })],
        index: 0,
        isBrowsable: true,
      }),
  };
};

export type PlayGuides = ReturnType<typeof usePlayGuides>;
