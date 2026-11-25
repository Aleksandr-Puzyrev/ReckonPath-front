import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { isApiError } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-leaders-styles";

interface IArenaLeadersStatus {
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
}

const SKELETON_ROWS = ["first", "second", "third"] as const;

const ArenaLeadersStatus = ({ isPending, error, onRetry }: IArenaLeadersStatus) => {
  const { t } = useTranslation();

  if (isPending) {
    return (
      <View
        testID="leaders-skeleton"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {SKELETON_ROWS.map((key) => (
          <View key={key} style={styles.skeletonRow} />
        ))}
      </View>
    );
  }
  return (
    <View style={styles.status}>
      <Text variant="body.s" style={styles.hint}>
        {t("errors.generic")}
      </Text>
      <Button testID="leaders-retry" label={t("common.retry")} size="s" onPress={onRetry} />
      {isApiError(error) ? (
        <Text variant="caption" style={styles.hint} testID="leaders-error-code">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
};

export default ArenaLeadersStatus;
