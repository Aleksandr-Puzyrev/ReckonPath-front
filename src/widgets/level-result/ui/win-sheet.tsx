import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { moveLimitOf } from "@reckon-path/engine";

import { levelStarsOf, useGameSessionStore } from "@entities/level";
import { useProgressStore } from "@entities/progress";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import { styles } from "./win-sheet-styles";

interface IWinSheet {
  isOpen: boolean;
  levelId: string;
  levelNumber: number;
  isRecord: boolean;
  isTutorial: boolean;
  hasNext: boolean;
  onNext: () => void;
  onAgain: () => void;
  onExit: () => void;
}

const WinSheet = ({
  isOpen,
  levelId,
  levelNumber,
  isRecord,
  isTutorial,
  hasNext,
  onNext,
  onAgain,
  onExit,
}: IWinSheet) => {
  const { t } = useTranslation();
  const game = useGameSessionStore((state) => state.game);
  const best = useProgressStore((state) => state.best[levelId]);
  if (game === null) return null;

  const earned = levelStarsOf(game);
  const limit = moveLimitOf(game);
  const bestMoves = best?.moves ?? game.movesUsed;

  return (
    <Sheet isOpen={isOpen} onDismiss={onExit} isDismissible={false}>
      <Text variant="eyebrow" style={styles.eyebrow}>
        {t("result.win.eyebrow", { n: levelNumber })}
      </Text>
      <Text variant="display.l" style={styles.center}>
        {t("result.win.title")}
      </Text>
      <View style={styles.stars}>
        <StarRating
          stars={earned}
          size="l"
          accessibilityLabel={t("result.stars", { count: earned })}
        />
      </View>
      {isRecord ? (
        <Text variant="title.s" style={styles.record}>
          {t("result.win.record")}
        </Text>
      ) : null}
      <Text variant="body.m" style={styles.moves}>
        {limit === null
          ? t("result.win.movesUnlimited", { used: game.movesUsed, best: bestMoves })
          : t("result.win.moves", { used: game.movesUsed, limit, best: bestMoves })}
      </Text>
      {isTutorial ? (
        <Text variant="body.m" style={styles.moves}>
          {t("onboarding.resultNote")}
        </Text>
      ) : null}
      {game.continued ? (
        <Text variant="caption" style={styles.moves}>
          {t("result.continue.note")}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <View style={styles.again}>
          <Button label={t("result.win.again")} onPress={onAgain} size="l" />
        </View>
        {hasNext ? (
          <View style={styles.next}>
            <Button label={t("result.win.next")} onPress={onNext} variant="primary" size="l" />
          </View>
        ) : null}
      </View>
      <Button label={t("play.pause.exit")} onPress={onExit} variant="ghost" />
    </Sheet>
  );
};

export default WinSheet;
