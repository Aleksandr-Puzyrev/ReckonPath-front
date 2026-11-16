import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import { styles } from "./level-unavailable-styles";

interface ILevelUnavailable {
  message: string;
  onExit: () => void;
  onRetry?: () => void;
}

const LevelUnavailable = ({ message, onExit, onRetry }: ILevelUnavailable) => {
  const { t } = useTranslation();

  return (
    <Screen style={styles.screen}>
      <Text variant="title.l" style={styles.text}>
        {message}
      </Text>
      {onRetry === undefined ? null : (
        <Button label={t("common.retry")} onPress={onRetry} variant="primary" />
      )}
      <Button
        label={t("play.pause.exit")}
        onPress={onExit}
        variant={onRetry === undefined ? "primary" : "secondary"}
      />
    </Screen>
  );
};

export default LevelUnavailable;
