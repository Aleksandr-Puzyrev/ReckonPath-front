import { useTranslation } from "react-i18next";

import type { TutorialStep } from "@features/tutorial";
import { CoachMark } from "@shared/ui/coach-mark";

interface ITutorialCoach {
  step: TutorialStep;
  canSkip: boolean;
  onNext: () => void;
  onSkip: () => void;
}

const STEP_TEXT = {
  tapFirst: "onboarding.tapCell",
  explainNumber: "onboarding.number",
  tapCloser: "onboarding.closer",
  findAlone: "onboarding.find",
} as const;

const TutorialCoach = ({ step, canSkip, onNext, onSkip }: ITutorialCoach) => {
  const { t } = useTranslation();

  return (
    <CoachMark
      text={t(STEP_TEXT[step])}
      action={
        step === "explainNumber" ? { label: t("onboarding.next"), onPress: onNext } : undefined
      }
      secondaryAction={canSkip ? { label: t("onboarding.skip"), onPress: onSkip } : undefined}
    />
  );
};

export default TutorialCoach;
