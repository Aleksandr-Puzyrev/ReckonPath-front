import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { isApiError } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-home-styles";
import ArenaHomeSkeleton from "./arena-home-skeleton";

interface IArenaHomeStatus {
  isPending: boolean;
  isOnline: boolean;
  error: Error | null;
  onRetry: () => void;
}

const ArenaHomeStatus = ({ isPending, isOnline, error, onRetry }: IArenaHomeStatus) => {
  const { t } = useTranslation();

  // Offline a query pauses instead of failing, so the network is checked before loading (без сети запрос ставится на паузу, а не падает, поэтому сеть проверяется раньше загрузки).
  if (!isOnline) {
    return (
      <Text variant="body.m" style={styles.message}>
        {t("common.offline")}
      </Text>
    );
  }
  if (isPending) return <ArenaHomeSkeleton />;
  return (
    <View style={styles.error}>
      <Text variant="body.m" style={styles.message}>
        {t("errors.generic")}
      </Text>
      <Button testID="arena-retry" label={t("common.retry")} onPress={onRetry} />
      {isApiError(error) ? (
        <Text variant="caption" style={styles.message}>
          {error.message}
        </Text>
      ) : null}
    </View>
  );
};

export default ArenaHomeStatus;
