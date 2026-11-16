import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { CampaignGameResult } from "@entities/level";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import TutorialWinSheet from "./tutorial-win-sheet";
import WinRewards from "./win-rewards";
import { styles } from "./win-sheet-styles";

interface IWinSheet {
  isOpen: boolean;
  levelNumber: number;
  result: CampaignGameResult;
  limit: number | null;
  isContinued: boolean;
  isTutorial: boolean;
  onNext: () => void;
  onAgain: () => void;
  onExit: () => void;
}

const WinSheet = ({
  isOpen,
  levelNumber,
  result,
  limit,
  isContinued,
  isTutorial,
  onNext,
  onAgain,
  onExit,
}: IWinSheet) => {
  const { t } = useTranslation();
  const { stars, moves } = result;
  if (isTutorial) {
    return <TutorialWinSheet isOpen={isOpen} stars={stars} onNext={onNext} onExit={onExit} />;
  }
  const best = result.bestMoves ?? moves;

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
          stars={stars}
          size="l"
          accessibilityLabel={t("result.stars", { count: stars })}
        />
      </View>
      {result.newRecord ? (
        <Text variant="title.s" style={styles.record}>
          {t("result.win.record")}
        </Text>
      ) : null}
      <Text variant="body.m" style={styles.moves}>
        {limit === null
          ? t("result.win.movesUnlimited", { used: moves, best })
          : t("result.win.moves", { used: moves, limit, best })}
      </Text>
      {isContinued ? (
        <Text variant="caption" style={styles.moves}>
          {t("result.continue.note")}
        </Text>
      ) : null}
      <WinRewards coins={result.reward} xp={result.xp} gems={result.worldGems ?? 0} />
      <View style={styles.actions}>
        <View style={styles.again}>
          <Button label={t("result.win.again")} onPress={onAgain} size="l" />
        </View>
        {result.nextLevel === undefined ? null : (
          <View style={styles.next}>
            <Button label={t("result.win.next")} onPress={onNext} variant="primary" size="l" />
          </View>
        )}
      </View>
      <Button label={t("play.pause.exit")} onPress={onExit} variant="ghost" />
    </Sheet>
  );
};

export default WinSheet;
