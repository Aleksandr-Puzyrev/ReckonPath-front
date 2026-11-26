import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { isEventCode, useCompetitionAvailable, useEvents } from "@entities/competition";
import { useIsOnline } from "@shared/api";
import { formatDateTime } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import EventHeader from "./event-header";
import EventQueryState from "./event-query-state";
import { styles } from "./event-styles";

const openEvent = (code: string) => router.push({ pathname: "/events/[code]", params: { code } });

const EventsScreen = () => {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState("");
  const code = input.trim().toUpperCase();
  const available = useCompetitionAvailable();
  const isOnline = useIsOnline();
  const events = useEvents();
  const rows = events.data?.pages.flat() ?? [];

  return (
    <Screen style={styles.screen}>
      <EventHeader title={t("competition.events")} isList />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!available ? (
          <Text variant="body.s">{t("competition.unavailable")}</Text>
        ) : (
          <>
            {!isOnline && <Text variant="body.s">{t("competition.offline")}</Text>}
            <View style={styles.section}>
              <TextField label={t("competition.code")} value={input} onChangeText={setInput} />
              <Button
                label={t("competition.find")}
                isDisabled={!isOnline || !isEventCode(code)}
                onPress={() => openEvent(code)}
              />
            </View>
            <EventQueryState
              isLoading={events.isLoading}
              error={events.error}
              isOnline={isOnline}
              onRetry={() => void events.refetch()}
            />
            {events.isSuccess && rows.length === 0 && (
              <Text variant="body.s">{t("competition.noEvents")}</Text>
            )}
            {rows.map((event) => (
              <View key={event.id} style={styles.card}>
                <Text variant="eyebrow">{t(`competition.status.${event.status}`)}</Text>
                <Text variant="title.m">{event.title}</Text>
                {!!event.description && <Text variant="body.s">{event.description}</Text>}
                <Text variant="caption">
                  {t(event.status === "scheduled" ? "competition.starts" : "competition.ends", {
                    date: formatDateTime(
                      event.status === "scheduled" ? event.startsAt : event.endsAt,
                      i18n.language,
                    ),
                  })}
                </Text>
                <Button
                  label={t("competition.details")}
                  accessibilityLabel={t("competition.openEvent", { title: event.title })}
                  onPress={() => openEvent(event.code)}
                />
              </View>
            ))}
            {events.hasNextPage && (
              <Button
                label={t("competition.more")}
                isDisabled={!isOnline || events.isFetchingNextPage}
                onPress={() => void events.fetchNextPage()}
              />
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

export default EventsScreen;
