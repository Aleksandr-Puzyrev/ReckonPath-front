import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useIsOnline } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./match-details-styles";

interface IMatchDetailsStatus {
  isPending: boolean;
  onRetry: () => void;
}

const MatchDetailsStatus = ({ isPending, onRetry }: IMatchDetailsStatus) => {
  const { t } = useTranslation();
  const isOnline = useIsOnline();

  if (!isOnline) {
    return (
      <Text variant="body.m" style={styles.message}>
        {t("common.offline")}
      </Text>
    );
  }
  if (isPending) return <View style={styles.skeleton} testID="details-skeleton" />;
  return (
    <View style={styles.error}>
      <Text variant="body.m" style={styles.message}>
        {t("errors.generic")}
      </Text>
      <Button label={t("common.retry")} onPress={onRetry} />
    </View>
  );
};

export default MatchDetailsStatus;
