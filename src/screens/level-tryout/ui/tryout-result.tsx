import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { GameStatus } from "@reckon-path/engine";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./level-tryout-styles";

interface ITryoutResult {
  status: Exclude<GameStatus, "playing">;
  moves: number;
  challenge: number | null;
  isAuthor: boolean;
  onAgain: () => void;
  onBack: () => void;
}

const TryoutResult = ({ status, moves, challenge, isAuthor, onAgain, onBack }: ITryoutResult) => {
  const { t } = useTranslation();
  const isWon = status === "won";
  // Decision 0044 #3: beating means fewer moves than the author; a loss never beats it (решение 0044 #3: побить — сделать меньше ходов, чем автор; проигрыш вызов не бьёт).
  const isBeaten = isWon && challenge !== null && moves < challenge;
  const challengeLine =
    challenge === null
      ? ""
      : `${t("code.play.challenge")}: ${t("code.play.challengeValue", { count: challenge })}`;

  return (
    <View style={styles.result} testID="tryout-result">
      <Text variant="title.l" accessibilityRole="header">
        {isWon ? t("result.win.title") : t("result.lose.title")}
      </Text>
      {challenge === null ? null : (
        <View style={styles.compare}>
          <Text variant="body.m">
            {isWon
              ? `${t("code.result.mine", { count: moves })} · ${challengeLine}`
              : challengeLine}
          </Text>
          <Text variant="title.s" style={isBeaten ? styles.beaten : styles.missed}>
            {isBeaten ? t("code.result.beaten") : t("code.result.missed")}
          </Text>
        </View>
      )}
      <Button
        testID="tryout-again"
        label={t("result.win.again")}
        variant="primary"
        size="l"
        onPress={onAgain}
      />
      <Button
        testID="tryout-editor"
        label={isAuthor ? t("editor.backToEditor") : t("code.result.toLevels")}
        variant="secondary"
        size="l"
        onPress={onBack}
      />
    </View>
  );
};

export default TryoutResult;
