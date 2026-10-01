import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import { styles } from "./level-not-found-styles";

interface ILevelNotFound {
  onExit: () => void;
}

const LevelNotFound = ({ onExit }: ILevelNotFound) => {
  const { t } = useTranslation();

  return (
    <Screen style={styles.screen}>
      <Text variant="title.l" style={styles.text}>
        {t("play.notFound")}
      </Text>
      <Button label={t("play.pause.exit")} onPress={onExit} variant="primary" />
    </Screen>
  );
};

export default LevelNotFound;
