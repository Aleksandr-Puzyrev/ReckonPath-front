import * as Linking from "expo-linking";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Share, View } from "react-native";

import {
  CompetitionReward,
  competitionKeys,
  isEventCode,
  useClaimEvent,
  useCompetitionAvailable,
  useEvent,
  useEventStandings,
  useJoinEvent,
  usePlayEvent,
} from "@entities/competition";
import { itemKeys } from "@entities/item";
import { useMeQuery, walletKeys } from "@entities/wallet";
import { errorMessageKey, useIsOnline } from "@shared/api";
import { formatDateTime, formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import EventHeader from "./event-header";
import EventQueryState from "./event-query-state";
import EventStandings from "./event-standings";
import { styles } from "./event-styles";

const EventDetail = ({ code }: { code: string }) => {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const query = useEvent(code);
  const standings = useEventStandings(code);
  const me = useMeQuery();
  const join = useJoinEvent(code);
  const play = usePlayEvent(code);
  const claim = useClaimEvent(code);
  const isOnline = useIsOnline();
  const event = query.data;
  const status = event?.status;
  useEffect(() => {
    if (status === "finished") {
      void client.invalidateQueries(
        { queryKey: competitionKeys.standings(code) },
        { cancelRefetch: false },
      );
    }
  }, [client, code, status]);
  const prizes = event?.prizes ?? [];
  const actionError = join.error ?? play.error ?? claim.error;
  const busy = !isOnline || join.isPending || play.isPending || claim.isPending;
  const format = (value: number) => formatNumber(value, i18n.language);
  const place = standings.data?.pages[0]?.find((row) => row.nickname === me.data?.nickname)?.rank;
  const canClaim = event?.status === "finished" && place !== undefined && place <= prizes.length;

  const start = (id: string) => {
    if (join.isError) join.reset();
    play.mutate(id, {
      onSuccess: (attempt) => {
        client.setQueryData(competitionKeys.attempt(code, attempt.id), attempt);
        router.push({ pathname: "/events/[code]/attempt/[id]", params: { code, id: attempt.id } });
      },
    });
  };

  const claimPrize = () =>
    claim.mutate(undefined, {
      onSuccess: async () => {
        await Promise.all([
          client.invalidateQueries({ queryKey: walletKeys.all }),
          client.invalidateQueries({ queryKey: itemKeys.inventory() }),
        ]);
      },
    });

  return (
    <Screen style={styles.screen}>
      <EventHeader title={event?.title ?? t("competition.events")} />
      <ScrollView contentContainerStyle={styles.content}>
        {!isOnline && <Text variant="body.s">{t("competition.offline")}</Text>}
        <EventQueryState
          isLoading={query.isLoading}
          error={query.error}
          isOnline={isOnline}
          onRetry={() => void query.refetch()}
        />
        {event && (
          <>
            <View style={styles.card}>
              <Text variant="eyebrow">{t(`competition.status.${event.status}`)}</Text>
              {!!event.description && <Text variant="body.s">{event.description}</Text>}
              <Text variant="body.s" selectable>
                {t("competition.eventCode", { code })}
              </Text>
              <Text variant="caption">
                {t(event.status === "scheduled" ? "competition.starts" : "competition.ends", {
                  date: formatDateTime(
                    event.status === "scheduled" ? event.startsAt : event.endsAt,
                    i18n.language,
                  ),
                })}
              </Text>
              {event.status !== "finished" &&
                (join.isSuccess || play.isSuccess ? (
                  <Text variant="body.s">{t("competition.joined")}</Text>
                ) : (
                  <Button
                    label={t("competition.join")}
                    variant="primary"
                    isDisabled={busy}
                    onPress={() => {
                      play.reset();
                      join.mutate();
                    }}
                  />
                ))}
            </View>
            <Button
              label={t("code.share.open")}
              onPress={() => {
                const url = Linking.createURL(`event-preview/${code}`);
                void Share.share({ message: `${event.title}\n${url}` });
              }}
            />
            {actionError && (
              <Text variant="body.s" accessibilityLiveRegion="polite">
                {t(errorMessageKey(actionError))}
              </Text>
            )}
            <View style={styles.section}>
              <Text variant="eyebrow" accessibilityRole="header">
                {t("competition.maps")}
              </Text>
              <Text variant="caption">
                {t("competition.attemptLimit", { value: format(event.attemptsPerMap) })}
              </Text>
              {event.maps.map((id, index) => (
                <Button
                  key={id}
                  label={t("competition.map", { value: format(index + 1) })}
                  isDisabled={busy || event.status !== "running"}
                  onPress={() => start(id)}
                />
              ))}
            </View>
            <EventStandings standings={standings} isOnline={isOnline} />
            {prizes.length > 0 && (
              <View style={styles.section}>
                <Text variant="eyebrow" accessibilityRole="header">
                  {t("competition.prizes")}
                </Text>
                {prizes.map((reward, index) => (
                  <View key={index} style={styles.card}>
                    <Text variant="title.s">
                      {t("competition.place", { value: format(index + 1) })}
                    </Text>
                    <CompetitionReward reward={reward} />
                  </View>
                ))}
                {claim.isSuccess ? (
                  <Text variant="body.s">{t("competition.claimed")}</Text>
                ) : (
                  canClaim && (
                    <Button
                      label={t("season.claim")}
                      variant="primary"
                      isDisabled={busy}
                      onPress={claimPrize}
                    />
                  )
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

const EventScreen = () => {
  const { code = "" } = useLocalSearchParams<{ code: string }>();
  const { t } = useTranslation();
  const available = useCompetitionAvailable();
  const normalized = code.toUpperCase();
  if (available && isEventCode(normalized))
    return <EventDetail key={normalized} code={normalized} />;
  return (
    <Screen style={styles.screen}>
      <EventHeader title={t("competition.events")} />
      <View style={styles.content}>
        <Text variant="body.s">
          {t(available ? "competition.invalidCode" : "competition.unavailable")}
        </Text>
      </View>
    </Screen>
  );
};

export default EventScreen;
