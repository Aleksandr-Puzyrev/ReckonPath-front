import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { RuleCardModal } from "@widgets/rule-card";

import { useArenaOnboarding } from "../model/use-arena-onboarding";

import ArenaIntroCard from "./arena-intro-card";
import IntroDemo from "./intro-demo";
import OnboardingStatus from "./onboarding-status";
import { styles } from "./arena-onboarding-styles";

const ArenaOnboardingScreen = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const onboarding = useArenaOnboarding(() =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t("errors.NETWORK") })),
  );
  const { format, card, elements } = onboarding;

  return (
    <Screen style={styles.screen}>
      {format === undefined || card === undefined ? (
        <OnboardingStatus
          isFailed={onboarding.isFailed}
          onRetry={onboarding.handleRetry}
          onLeave={onboarding.handleLeave}
        />
      ) : (
        <ArenaIntroCard
          card={card}
          index={onboarding.index}
          format={format}
          isStarting={onboarding.isStarting}
          onNext={onboarding.handleNext}
          onSkip={onboarding.handleSkip}
        />
      )}
      {elements === null ? null : (
        <RuleCardModal
          cards={elements}
          renderDemo={(id) => <IntroDemo card={id} />}
          onClose={onboarding.handleElementsClose}
        />
      )}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaOnboardingScreen;
