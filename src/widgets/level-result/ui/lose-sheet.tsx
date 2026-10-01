import { useTranslation } from "react-i18next";

import { canContinue } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";
import { ContinueOptions } from "@features/continue-game";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import { styles } from "./lose-sheet-styles";

interface ILoseSheet {
  isOpen: boolean;
  isBombLoss: boolean;
  onContinued: () => void;
  onRestart: () => void;
  onDecline: () => void;
  onExit: () => void;
}

const LoseSheet = ({
  isOpen,
  isBombLoss,
  onContinued,
  onRestart,
  onDecline,
  onExit,
}: ILoseSheet) => {
  const { t } = useTranslation();
  const game = useGameSessionStore((state) => state.game);
  if (game === null) return null;

  return (
    <Sheet isOpen={isOpen} onDismiss={onDecline} isDismissible={false}>
      <Text variant="display.m" style={styles.center}>
        {t(isBombLoss ? "result.lose.bombTitle" : "result.lose.title")}
      </Text>
      <Text variant="body.m" style={styles.found}>
        {t("result.lose.found", { found: game.found.size, total: game.board.targets.length })}
      </Text>
      {canContinue(game) ? <ContinueOptions onContinued={onContinued} /> : null}
      <Button label={t("play.pause.restart")} onPress={onRestart} />
      <Button label={t("play.pause.exit")} onPress={onExit} variant="ghost" />
      {canContinue(game) ? (
        <Button label={t("result.lose.decline")} onPress={onDecline} variant="ghost" />
      ) : null}
    </Sheet>
  );
};

export default LoseSheet;
