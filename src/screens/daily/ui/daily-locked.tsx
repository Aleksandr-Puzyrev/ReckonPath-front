import { useTranslation } from "react-i18next";

import { DAILY_UNLOCK_LEVEL } from "@features/daily-today";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import { styles } from "./daily-locked-styles";

interface IDailyLocked {
  onBack: () => void;
}

const DailyLocked = ({ onBack }: IDailyLocked) => {
  const { t } = useTranslation();

  return (
    <Screen style={styles.screen}>
      <Text variant="title.l" style={styles.text}>
        {t("daily.locked", { n: DAILY_UNLOCK_LEVEL })}
      </Text>
      <Button label={t("common.back")} onPress={onBack} variant="primary" />
    </Screen>
  );
};

export default DailyLocked;
