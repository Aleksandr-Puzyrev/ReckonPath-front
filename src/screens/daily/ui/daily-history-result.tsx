import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

import { dayResultOf, useDailyDay } from "@entities/daily";
import { errorMessageKey, useIsOnline } from "@shared/api";
import { formatDayMonth, formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { Text } from "@shared/ui/text";

interface IDailyHistoryResult {
  date: string;
  onClose: () => void;
}

const DailyHistoryResult = ({ date, onClose }: IDailyHistoryResult) => {
  const { t, i18n } = useTranslation();
  const query = useDailyDay(date);
  const isOnline = useIsOnline();
  const result = dayResultOf(query.data);
  const format = (value: number) => formatNumber(value, i18n.language);
  return (
    <Dialog
      isOpen
      title={formatDayMonth(date, i18n.language)}
      onCancel={onClose}
      actions={[{ label: t("common.close"), variant: "secondary", onPress: onClose }]}
    >
      {!isOnline && <Text variant="body.s">{t("daily.network")}</Text>}
      {query.isLoading && <ActivityIndicator accessibilityLabel={t("competition.loading")} />}
      {query.isError && (
        <>
          <Text variant="body.s">{t(errorMessageKey(query.error))}</Text>
          <Button
            label={t("common.retry")}
            isDisabled={!isOnline}
            onPress={() => void query.refetch()}
          />
        </>
      )}
      {query.isSuccess && result === null && (
        <Text variant="body.m">{t("competition.noStandings")}</Text>
      )}
      {result !== null && (
        <>
          <Text variant="body.m">{t("result.stars", { count: result.stars })}</Text>
          <Text variant="body.m">
            {t("play.hud.moves")} · {format(result.moves)}
          </Text>
          {result.place && (
            <Text variant="body.m">
              {t("competition.place", { value: format(result.place.rank) })} /{" "}
              {format(result.place.total)}
            </Text>
          )}
        </>
      )}
    </Dialog>
  );
};

export default DailyHistoryResult;
