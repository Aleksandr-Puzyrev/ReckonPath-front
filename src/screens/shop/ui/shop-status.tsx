import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { ShopGridSkeleton } from "@widgets/shop-grid";

import { styles } from "./shop-status-styles";

interface IShopStatus {
  isPending: boolean;
  isOnline: boolean;
  onRetry: () => void;
}

const ShopStatus = ({ isPending, isOnline, onRetry }: IShopStatus) => {
  const { t } = useTranslation();

  // Offline a query pauses instead of failing, so the network is checked before loading (без сети запрос ставится на паузу, а не падает, поэтому сеть проверяется раньше загрузки).
  if (!isOnline) {
    return (
      <Text variant="body.m" style={styles.message}>
        {t("common.offline")}
      </Text>
    );
  }
  if (isPending) return <ShopGridSkeleton />;
  return (
    <View style={styles.error}>
      <Text variant="body.m" style={styles.message}>
        {t("errors.generic")}
      </Text>
      <Button testID="shop-retry" label={t("common.retry")} onPress={onRetry} />
    </View>
  );
};

export default ShopStatus;
