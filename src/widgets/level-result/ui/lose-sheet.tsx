import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import { styles } from "./lose-sheet-styles";

interface ILoseSheet {
  isOpen: boolean;
  isBombLoss: boolean;
  found: number;
  total: number;
  continueOptions: ReactNode;
  onRestart: () => void;
  onDecline: () => void;
  onExit: () => void;
}

const LoseSheet = ({
  isOpen,
  isBombLoss,
  found,
  total,
  continueOptions,
  onRestart,
  onDecline,
  onExit,
}: ILoseSheet) => {
  const { t } = useTranslation();
  const canContinue = continueOptions !== null;

  return (
    <Sheet isOpen={isOpen} onDismiss={onDecline} isDismissible={false}>
      <Text variant="display.m" style={styles.center}>
        {t(isBombLoss ? "result.lose.bombTitle" : "result.lose.title")}
      </Text>
      <Text variant="body.m" style={styles.found}>
        {t("result.lose.found", { found, total })}
      </Text>
      {continueOptions}
      <Button label={t("play.pause.restart")} onPress={onRestart} />
      <Button label={t("play.pause.exit")} onPress={onExit} variant="ghost" />
      {canContinue ? (
        <Button label={t("result.lose.decline")} onPress={onDecline} variant="ghost" />
      ) : null}
    </Sheet>
  );
};

export default LoseSheet;
