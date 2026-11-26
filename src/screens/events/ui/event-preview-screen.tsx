import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { CompetitionReward, isEventCode, useEventPreview } from "@entities/competition";
import { useHasAccount, useIsOnline } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";
import { formatDateTime, formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import EventHeader from "./event-header";
import EventQueryState from "./event-query-state";
import { styles } from "./event-styles";

const EventPreviewScreen = () => {
  const { code = "" } = useLocalSearchParams<{ code: string }>();
  const { t, i18n } = useTranslation();
  const normalized = code.toUpperCase();
  const query = useEventPreview(normalized);
  const hasAccount = useHasAccount();
  const isOnline = useIsOnline();
  const event = query.data;
  const openEvent = () => {
    if (!hasAccount) {
      router.push({ pathname: "/account/sign-in", params: { eventCode: normalized } });
      return;
    }
    router.push({ pathname: "/events/[code]", params: { code: normalized } });
  };

  return (
    <Screen style={styles.screen}>
      <EventHeader
        title={event?.title ?? t("competition.events")}
        fallback={hasAccount ? "/events" : "/account/sign-in"}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {!HAS_BACKEND && <Text variant="body.s">{t("competition.unavailable")}</Text>}
        {!isEventCode(normalized) && <Text variant="body.s">{t("competition.invalidCode")}</Text>}
        {!isOnline && <Text variant="body.s">{t("competition.offline")}</Text>}
        <EventQueryState
          isLoading={query.isLoading}
          isOnline={isOnline}
          error={query.error}
          onRetry={() => void query.refetch()}
        />
        {event && (
          <>
            <View style={styles.card}>
              <Text variant="eyebrow">{t(`competition.status.${event.status}`)}</Text>
              {!!event.description && <Text variant="body.m">{event.description}</Text>}
              <Text variant="body.s" selectable>
                {t("competition.eventCode", { code: normalized })}
              </Text>
              <Text variant="caption">
                {t(event.status === "scheduled" ? "competition.starts" : "competition.ends", {
                  date: formatDateTime(
                    event.status === "scheduled" ? event.startsAt : event.endsAt,
                    i18n.language,
                  ),
                })}
              </Text>
            </View>
            {event.prizes?.map((reward, index) => (
              <View key={index} style={styles.card}>
                <Text variant="title.s">
                  {t("competition.place", { value: formatNumber(index + 1, i18n.language) })}
                </Text>
                <CompetitionReward reward={reward} />
              </View>
            ))}
            <Button
              variant="primary"
              label={t(hasAccount ? "competition.details" : "competition.signIn")}
              onPress={openEvent}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

export default EventPreviewScreen;
