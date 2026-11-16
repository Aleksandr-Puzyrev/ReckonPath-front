import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { levelOfBoard, tapIdxOfBoard } from "@entities/match";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { LeagueProgress } from "@widgets/arena-hero";
import { formatTrophyDelta } from "@widgets/match-history";

import { resultReasonOf } from "../model/result-reason";
import { rewardsOf } from "../model/rewards-of";
import { useArenaResult } from "../model/use-arena-result";

import { styles } from "./arena-result-styles";
import LeagueMoment from "./league-moment";
import ResultMaps from "./result-maps";
import RewardRow from "./reward-row";

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
        <Text variant="display.m" style={styles.centered} testID="result-trophies">
          {t("result.pvp.trophies", {
            count: Math.abs(result.trophies),
            delta: formatTrophyDelta(result.trophies),
          })}
        </Text>
        <LeagueProgress
          trophies={result.trophyNow}
          fromTrophies={result.trophyNow - result.trophies}
          league={result.league}
          next={result.next}
          isOnHero={false}
        />
        <RewardRow rewards={rewardsOf(result)} />
        {rival.bot === true || isMap ? (
          <Text variant="caption" style={[styles.secondary, styles.centered]}>
            {isMap ? t("async.half") : t("match.botTrophies")}
          </Text>
        ) : null}
        <Button testID="result-again" label={t("result.pvp.again")} onPress={view.handleAgain} />
        <Button
          testID="result-arena"
          label={t("search.toArena")}
          variant="ghost"
          onPress={view.handleArena}
        />
      </ScrollView>
      {view.promotion === null ? null : (
        <LeagueMoment promotion={view.promotion} onNext={view.handlePromotionClose} />
      )}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaResultScreen;
