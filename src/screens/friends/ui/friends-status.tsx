import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { isApiError } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import FriendsSkeleton from "./friends-skeleton";
import { styles } from "./friends-screen-styles";

interface IFriendsStatus {
  isPending: boolean;
  isOnline: boolean;
  error: Error | null;
  onRetry: () => void;
}

// Offline a query pauses instead of failing, so the network is checked before loading (без сети запрос ставится на паузу, а не падает, поэтому сеть проверяется раньше загрузки).
const FriendsStatus = ({ isPending, isOnline, error, onRetry }: IFriendsStatus) => {
  const { t } = useTranslation();

  if (!isOnline) {
    return (
      <Text variant="body.m" style={styles.message}>
        {t("friends.offlineBar")}
      </Text>
    );
  }
  if (isPending) return <FriendsSkeleton />;
  return (
    <View style={styles.status}>
      <Text variant="body.m" style={styles.message}>
        {t("errors.generic")}
      </Text>
      <Button testID="friends-retry" label={t("common.retry")} onPress={onRetry} />
      {isApiError(error) ? (
        <Text variant="caption" style={styles.message} testID="friends-error-code">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
};

export default FriendsStatus;
