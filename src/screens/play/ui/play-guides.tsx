import { useUnistyles } from "react-native-unistyles";

import type { LevelInput } from "@reckon-path/engine";

import { RULE_DEMOS } from "@entities/rules";
import type { RuleCardId } from "@entities/rules";
import { BoardDemo } from "@widgets/board";
import { RuleCardModal } from "@widgets/rule-card";
import { RulesSheet } from "@widgets/rules-list";

import type { usePlayGuides } from "../model/use-play-guides";

interface IPlayGuides {
  level: LevelInput;
  guides: ReturnType<typeof usePlayGuides>;
}

const PlayGuides = ({ level, guides }: IPlayGuides) => {
  const { rt, theme } = useUnistyles();
  const demoSize =
    Math.min(rt.screen.width, theme.sizes.contentMaxWidth) * theme.sizes.ruleCard.demoShare;
  const fogCount = level.fog ?? undefined;

  const renderDemo = (id: RuleCardId) => {
    const demo = RULE_DEMOS[id];
    return (
      <BoardDemo
        level={demo.level}
        taps={demo.taps}
        flags={demo.flags}
        highlight={demo.highlight}
        size={demoSize}
      />
    );
  };

  return (
    <>
      <RulesSheet
        isOpen={guides.isRulesOpen && guides.shownCards === null}
        cards={guides.metCards}
        fogCount={fogCount}
        onOpenCard={guides.handleRuleOpen}
        onClose={guides.handleRulesClose}
      />
      {guides.shownCards === null ? null : (
        <RuleCardModal
          key={`${guides.shownCards.cards.join(",")}-${guides.shownCards.index}`}
          cards={guides.shownCards.cards}
          initialIndex={guides.shownCards.index}
          isBrowsable={guides.shownCards.isBrowsable}
          fogCount={fogCount}
          renderDemo={renderDemo}
          onClose={guides.handleCardsClose}
        />
      )}
    </>
  );
};

export default PlayGuides;
