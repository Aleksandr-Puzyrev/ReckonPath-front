import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { moveLimitOf, stars } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";
import { useProgressStore } from "@entities/progress";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import StarIcon from "@assets/icons/play/star.svg";

import { styles } from "./win-sheet-styles";

interface IWinSheet {
  isOpen: boolean;
  levelId: string;
  levelNumber: number;
  isRecord: boolean;
  hasNext: boolean;
  onNext: () => void;
  onAgain: () => void;
  onExit: () => void;
}

const STAR_SLOTS = [1, 2, 3] as const;

const WinSheet = ({
  isOpen,
  levelId,
  levelNumber,
  isRecord,
  hasNext,
  onNext,
  onAgain,
  onExit,
}: IWinSheet) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const game = useGameSessionStore((state) => state.game);
  const best = useProgressStore((state) => state.best[levelId]);
  if (game === null) return null;

  const earned = stars(game) ?? 0;
  const limit = moveLimitOf(game);
  const bestMoves = best?.moves ?? game.movesUsed;
  const starSize = theme.sizes.icon.xl;

  return (
    <Sheet isOpen={isOpen} onDismiss={onExit} isDismissible={false}>
      <Text variant="eyebrow" style={styles.eyebrow}>
        {t("result.win.eyebrow", { n: levelNumber })}
      </Text>
      <Text variant="display.l" style={styles.center}>
        {t("result.win.title")}
      </Text>
      <View
        style={styles.stars}
        accessible
        accessibilityLabel={t("result.stars", { count: earned })}
      >
        {STAR_SLOTS.map((slot) => (
          <StarIcon
            key={slot}
            width={starSize}
            height={starSize}
            color={slot <= earned ? theme.colors.currency.coin : theme.colors.border.strong}
          />
        ))}
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
