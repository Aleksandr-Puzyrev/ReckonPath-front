import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

import { errorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

interface IEventQueryState {
  isLoading: boolean;
  isOnline: boolean;
  error: Error | null;
  onRetry: () => void;
}

const EventQueryState = ({ isLoading, isOnline, error, onRetry }: IEventQueryState) => {
  const { t } = useTranslation();
  return (
    <>
      {isLoading && <ActivityIndicator accessibilityLabel={t("competition.loading")} />}
      {error !== null && (
        <>
          <Text variant="body.s" accessibilityLiveRegion="polite">
            {t(errorMessageKey(error))}
          </Text>
          <Button label={t("common.retry")} isDisabled={!isOnline} onPress={onRetry} />
        </>
      )}
    </>
  );
};

export default EventQueryState;
