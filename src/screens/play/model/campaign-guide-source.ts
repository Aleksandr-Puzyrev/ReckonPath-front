import { LEVEL_LESSONS } from "@reckon-path/content";

import type { CampaignLevel } from "@entities/level";
import { TUTORIAL_KEYS, cardOfServerKey, isRuleCardId } from "@entities/rules";
import type { RuleCardId, TutorialKey } from "@entities/rules";

// Lessons no element shows (the flags card) stay with the bundled level of the same number (уроки без элемента — карточка флажков — остаются у встроенного уровня с тем же номером).
const lessonsOf = (number: number) => (LEVEL_LESSONS[`c-${number}`] ?? []).filter(isRuleCardId);

const tutorialKeyOf = (key: string | undefined, expected: TutorialKey) =>
  key === expected ? expected : null;

export const campaignGuideSource = (level: CampaignLevel) => ({
  cardsBefore: [
    ...level.introduces.flatMap((key): RuleCardId[] => {
      const id = cardOfServerKey(key);
      return id === null ? [] : [id];
    }),
    ...lessonsOf(level.number),
  ],
  tutorialKey: tutorialKeyOf(level.tutorial, TUTORIAL_KEYS.firstLevel),
  movesHintKey: tutorialKeyOf(level.tutorial, TUTORIAL_KEYS.movesLimit),
});
