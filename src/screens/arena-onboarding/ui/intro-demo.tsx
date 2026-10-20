import { useUnistyles } from "react-native-unistyles";

import { RULE_DEMOS } from "@entities/rules";
import type { RuleCardId } from "@entities/rules";
import { BoardDemo } from "@widgets/board";

import type { ArenaIntroCard } from "../model/arena-intro-cards";

import TurnsDemo from "./turns-demo";

interface IIntroDemo {
  card: ArenaIntroCard | RuleCardId;
}

const FIRST_DEMO: RuleCardId = "multi";

const IntroDemo = ({ card }: IIntroDemo) => {
  const { rt, theme } = useUnistyles();
  if (card === "turns") return <TurnsDemo />;

  const size =
    Math.min(rt.screen.width, theme.sizes.contentMaxWidth) * theme.sizes.ruleCard.demoShare;
  const demo = RULE_DEMOS[card === "first" ? FIRST_DEMO : card];
  return (
    <BoardDemo
      level={demo.level}
      taps={demo.taps}
      flags={demo.flags}
      highlight={demo.highlight}
      size={size}
    />
  );
};

export default IntroDemo;
