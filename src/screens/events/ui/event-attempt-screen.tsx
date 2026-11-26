import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { uuidv7 } from "uuidv7";

import type { Idx } from "@reckon-path/engine";

import { hapticsForEvents } from "@features/tap-cell";
import {
  storeEventAttempt,
  isEventCode,
  useCompetitionAvailable,
  useEventAttempt,
  useTapEvent,
} from "@entities/competition";
import type { EventAttempt } from "@entities/competition";
import { serverTapEvents } from "@entities/level";
import { errorMessageKey, isApiError, useIsOnline } from "@shared/api";
import { haptic } from "@shared/haptics";
import { formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { AnswerPanel } from "@widgets/answer-panel";
import { Board, useBoardFx } from "@widgets/board";
import { Hud } from "@widgets/hud";

import { eventPlayView, serverGameOfEvent } from "../model/event-play-view";

import EventHeader from "./event-header";
import EventQueryState from "./event-query-state";
import { styles } from "./event-styles";

interface IEventBoard {
  attempt: EventAttempt;
  code: string;
  isOnline: boolean;
  resync: () => Promise<EventAttempt | undefined>;
}

const EventBoard = ({ attempt, code, isOnline, resync }: IEventBoard) => {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const tap = useTapEvent(code, attempt.id);
  const pending = useRef(false);
  const [size, setSize] = useState(0);
  const [flags, setFlags] = useState<Idx[]>([]);
  const [flagMode, setFlagMode] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const fx = useBoardFx();
  const view = eventPlayView(attempt);
  const hasUncertainTap =
    tap.isError &&
    (!isApiError(tap.error) ||
      tap.error.status >= 500 ||
      tap.error.code === "competition_unavailable");

  const toggleFlag = (cell: Idx) => {
    if (view.status !== "playing" || view.revealed.has(cell)) return;
    setFlags((current) =>
      current.includes(cell) ? current.filter((flag) => flag !== cell) : [...current, cell],
    );
  };

  const send = (request: { cell: number; seq: number; idempotencyKey: string }) => {
    if (!isOnline || pending.current) return;
    pending.current = true;
    tap.mutate(request, {
      onSuccess: (updated) => {
        const events = serverTapEvents(
          request.cell,
          serverGameOfEvent(updated),
          eventPlayView(updated),
        );
        fx.play(request.cell, events);
        haptic(...hapticsForEvents(events));
      },
      onSettled: () => {
        pending.current = false;
      },
    });
  };

  const press = (cell: Idx) => {
    if (flagMode) {
      toggleFlag(cell);
      return;
    }
    if (
      view.status !== "playing" ||
      flags.includes(cell) ||
      view.revealed.has(cell) ||
      hasUncertainTap
    )
      return;
    if (view.board.kinds[cell] === "rock") {
      fx.play(cell, [{ type: "blocked", cell }]);
      return;
    }
    send({ cell, seq: attempt.seq, idempotencyKey: uuidv7() });
  };

  const retry = async () => {
    if (pending.current || tap.variables === undefined) return;
    pending.current = true;
    const request = tap.variables;
    let refreshed: EventAttempt | undefined;
    try {
      refreshed = await resync();
    } finally {
      pending.current = false;
    }
    if (refreshed === undefined) return;
    if (refreshed.seq === request.seq && refreshed.status === "play") {
      send(request);
      return;
    }
    storeEventAttempt(client, code, refreshed);
    tap.reset();
  };

  return (
    <>
      <Hud view={view} onModeInfo={() => setShowMode((visible) => !visible)} />
      {showMode && (
        <Text variant="body.s" style={styles.footer}>
          {t(`competition.modes.${attempt.board.mode}`)}
        </Text>
      )}
      <View
        testID="event-board-area"
        style={styles.board}
        onLayout={({ nativeEvent: { layout } }) => setSize(Math.min(layout.width, layout.height))}
      >
        {size > 0 && (
          <Board
            view={view}
            flags={flags}
            size={size}
            fx={fx}
            showHidden={false}
            onCellPress={press}
            onCellLongPress={toggleFlag}
          />
        )}
      </View>
      <View style={styles.footer}>
        {tap.isError && (
          <>
            <Text variant="body.s" accessibilityLiveRegion="polite">
              {t(errorMessageKey(tap.error))}
            </Text>
            {hasUncertainTap && (
              <Button
                label={t("common.retry")}
                isDisabled={!isOnline || tap.isPending}
                onPress={() => void retry()}
              />
            )}
          </>
        )}
        {view.status !== "playing" && (
          <Text variant="title.s" accessibilityLiveRegion="polite">
            {t(view.status === "won" ? "competition.won" : "competition.lost", {
              score: formatNumber(attempt.score, i18n.language),
            })}
          </Text>
        )}
      </View>
      <AnswerPanel
        view={view}
        isFlagMode={flagMode}
        onToggleFlagMode={() => setFlagMode((enabled) => !enabled)}
      />
    </>
  );
};

const EventAttemptScreen = () => {
  const { code = "", id = "" } = useLocalSearchParams<{ code: string; id: string }>();
  const { t } = useTranslation();
  const available = useCompetitionAvailable() && isEventCode(code);
  const isOnline = useIsOnline();
  const query = useEventAttempt(code, id);

  return (
    <Screen style={styles.screen}>
      <EventHeader title={t("competition.maps")} />
      {!available && (
        <Text variant="body.s" style={styles.footer}>
          {t("competition.unavailable")}
        </Text>
      )}
      {available && (
        <>
          {!isOnline && (
            <Text variant="body.s" style={styles.footer}>
              {t("competition.offline")}
            </Text>
          )}
          <EventQueryState
            isLoading={query.isLoading}
            error={query.error}
            isOnline={isOnline}
            onRetry={() => void query.refetch()}
          />
          {query.data && (
            <EventBoard
              key={query.data.id}
              attempt={query.data}
              code={code}
              isOnline={isOnline}
              resync={async () => {
                const result = await query.refetch();
                return result.isSuccess ? result.data : undefined;
              }}
            />
          )}
        </>
      )}
    </Screen>
  );
};

export default EventAttemptScreen;
