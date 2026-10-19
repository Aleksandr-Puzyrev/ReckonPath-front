import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import { toIdx } from "@reckon-path/engine";

import { levelOfMap } from "@entities/arena-map";
import { layoutLevelOf } from "@entities/match";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { divisionStateOf, LeagueProgress } from "@widgets/arena-hero";
import { NoMapDialog } from "@widgets/find-match";
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
  annulled: "arena.history.annulled",
} as const;

type Cell = [number, number];

const cellsOf = (cells: readonly (readonly number[])[]) =>
  cells.map(([row = 0, col = 0]): Cell => [row, col]);

const ArenaResultScreen = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const view = useArenaResult((messageKey) => showToast(t(messageKey)));
  const { end, layout, format, opponent, myMap } = view;

  if (end === null || layout === null || format === null || opponent === null) {
    return <Screen style={styles.screen} />;
  }

  const size = format.size;
  const theirLevel = {
    ...layoutLevelOf(layout, size),
    targets: cellsOf(end.maps.opponent.targets),
    bombs: cellsOf(end.maps.opponent.bombs),
  };
  const myLevel = myMap === null ? null : levelOfMap(myMap.map);
  const theirTaps = view.myTaps.map(({ cell }) => toIdx(size, cell));
  const myTaps = view.opponentTaps.map(({ cell }) => toIdx(size, cell));
  const after = divisionStateOf(end.trophies.after);
  const reason = resultReasonOf(end, t);

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="display.l" accessibilityRole="header" style={styles.centered}>
          {t(TITLES[end.result])}
        </Text>
        {reason === null ? null : (
          <Text variant="body.m" style={[styles.secondary, styles.centered]}>
            {reason}
          </Text>
        )}
        <ResultMaps
          myLevel={myLevel}
          theirLevel={theirLevel}
          myTaps={myTaps}
          theirTaps={theirTaps}
          opponentName={opponent.nickname}
          zoomed={view.zoomed}
          onZoom={view.handleZoom}
        />
        <Text variant="display.m" style={styles.centered} testID="result-trophies">
          {t("result.pvp.trophies", {
            count: Math.abs(end.trophies.delta),
            delta: formatTrophyDelta(end.trophies.delta),
          })}
        </Text>
        <LeagueProgress
          trophies={end.trophies.after}
          fromTrophies={end.trophies.before}
          league={after.league}
          division={after.division}
          min={after.min}
          max={after.max}
          isOnHero={false}
        />
        <RewardRow rewards={rewardsOf(end)} />
        {opponent.isBot ? (
          <Text variant="caption" style={[styles.secondary, styles.centered]}>
            {t("match.botTrophies")}
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
      <NoMapDialog
        isOpen={view.find.isNoMapOpen}
        isPending={view.find.isRandomPending}
        onBuild={view.find.handleBuildMap}
        onRandom={view.find.handleRandomMap}
        onClose={view.find.handleNoMapClose}
      />
      {view.isLeagueMomentOpen ? (
        <LeagueMoment
          trophies={end.trophies.after}
          isUp={view.isLeagueUp}
          onNext={view.handleLeagueMomentClose}
        />
      ) : null}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaResultScreen;
