import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { levelOfBoard, tapIdxOfBoard } from "@entities/match";
import { BlockPlayerDialog } from "@features/block-player";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import { resultReasonOf } from "../model/result-reason";
import { useArenaResult } from "../model/use-arena-result";
import { useResultRival } from "../model/use-result-rival";

import { styles } from "./arena-result-styles";
import LeagueMoment from "./league-moment";
import ResultActions from "./result-actions";
import ResultMaps from "./result-maps";
import ResultStanding from "./result-standing";
import RivalMenu from "./rival-menu";

const TITLES = {
  win: "result.pvp.win",
  loss: "result.pvp.lose",
  draw: "result.pvp.draw",
} as const;

const ArenaResultScreen = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const view = useArenaResult(showToast);
  const { match } = view;
  const rivalActions = useResultRival(match, showToast);

  if (match === null || match.result === undefined || match.rivalMap === undefined) {
    return (
      <Screen style={styles.screen}>
        {view.isFailed ? (
          <View style={styles.content}>
            <Text variant="body.m" style={styles.centered}>
              {t("errors.generic")}
            </Text>
            <Button testID="result-retry" label={t("common.retry")} onPress={view.handleRetry} />
          </View>
        ) : null}
      </Screen>
    );
  }

  const { result, rival, myMap, rivalMap } = match;
  const isMap = match.kind === "map";
  const isFriendly = match.friendly === true;
  const reason = resultReasonOf(match, t);

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="display.l" accessibilityRole="header" style={styles.centered}>
          {t(TITLES[result.outcome])}
        </Text>
        {reason === null ? null : (
          <Text variant="body.m" style={[styles.secondary, styles.centered]}>
            {reason}
          </Text>
        )}
        <ResultMaps
          myLevel={myMap === undefined ? null : levelOfBoard(myMap)}
          theirLevel={levelOfBoard(rivalMap)}
          myTaps={myMap === undefined ? [] : tapIdxOfBoard(myMap)}
          theirTaps={tapIdxOfBoard(rivalMap)}
          theirLabel={
            isMap
              ? t("async.mapTaps", { name: rival.name })
              : t("result.pvp.theirMap", { name: rival.name })
          }
          zoomed={view.zoomed}
          onZoom={view.handleZoom}
        />
        {isFriendly ? (
          <Text
            variant="body.m"
            style={[styles.secondary, styles.centered]}
            testID="result-friendly"
          >
            {t("result.pvp.friendly")}
          </Text>
        ) : (
          <ResultStanding result={result} />
        )}
        {!isFriendly && (rival.bot === true || isMap) ? (
          <Text variant="caption" style={[styles.secondary, styles.centered]}>
            {isMap ? t("async.half") : t("match.botTrophies")}
          </Text>
        ) : null}
        {isFriendly ? null : (
          <Button testID="result-again" label={t("result.pvp.again")} onPress={view.handleAgain} />
        )}
        <ResultActions
          arenaLabel={isFriendly ? t("result.pvp.back") : t("search.toArena")}
          rival={rivalActions}
          onArena={view.handleArena}
        />
      </ScrollView>
      {view.promotion === null ? null : (
        <LeagueMoment promotion={view.promotion} onNext={view.handlePromotionClose} />
      )}
      <RivalMenu rival={rivalActions} />
      <BlockPlayerDialog block={rivalActions.block} />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaResultScreen;
