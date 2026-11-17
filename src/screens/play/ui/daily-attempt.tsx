import { useTranslation } from "react-i18next";

import { Text } from "@shared/ui/text";

import { styles } from "./daily-attempt-styles";

interface IDailyAttempt {
  attempt: number;
}

const DailyAttempt = ({ attempt }: IDailyAttempt) => {
  const { t } = useTranslation();

  return (
    <Text variant="caption" style={styles.text} testID="daily-attempt">
      {t("daily.attempt", { n: attempt })}
    </Text>
  );
};

export default DailyAttempt;
