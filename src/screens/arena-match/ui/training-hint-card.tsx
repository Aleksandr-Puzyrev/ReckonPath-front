import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import type { TrainingHint } from "../model/training-hint";

import { styles } from "./arena-match-styles";

interface ITrainingHintCard {
  hint: TrainingHint;
  onNext: () => void;
}

const isEnd = (hint: TrainingHint) => hint === "won" || hint === "lost";

const TrainingHintCard = ({ hint, onNext }: ITrainingHintCard) => {
  const { t } = useTranslation();

  return (
    <View style={styles.hint} testID="training-hint">
      <Text variant="title.s">{t(`training.hint.${hint}.title`)}</Text>
      <Text variant="body.s" style={styles.secondary}>
        {t(`training.hint.${hint}.text`)}
      </Text>
      {isEnd(hint) ? (
        <Button
          testID="training-next"
          label={t("training.next").toLocaleUpperCase()}
          variant="primary"
          size="m"
          onPress={onNext}
        />
      ) : null}
    </View>
  );
};

export default TrainingHintCard;
