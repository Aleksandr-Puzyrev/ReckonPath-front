import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { MatchEnd } from "@entities/match";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { formatTrophyDelta } from "@widgets/match-history";

import { styles } from "./arena-match-styles";

interface IEndOverlay {
  end: MatchEnd;
  maps: ReactNode;
  onLeave: () => void;
}

const TITLES = {
  win: "result.pvp.win",
  loss: "result.pvp.lose",
  draw: "result.pvp.draw",
  annulled: "arena.history.annulled",
} as const;

const OPPONENT_REASONS: ReadonlySet<MatchEnd["reason"]> = new Set(["surrender", "afk"]);

const EndOverlay = ({ end, maps, onLeave }: IEndOverlay) => {
  const { t } = useTranslation();

  const reasonText = () => {
    if (end.reason === "targets") return t("result.pvp.reason.targets", { count: end.turns.me });
    // Part 5 words these reasons from the winner's side only (Часть 5 формулирует эти причины только со стороны победителя).
    if (OPPONENT_REASONS.has(end.reason) && end.result !== "win") return null;
    return t(`result.pvp.reason.${end.reason}`);
  };
  const reason = reasonText();

  return (
    <View style={styles.overlay} testID="match-end">
      <Text variant="display.l" accessibilityRole="header">
        {t(TITLES[end.result])}
      </Text>
      {reason === null ? null : (
        <Text variant="body.m" style={styles.secondary}>
          {reason}
        </Text>
      )}
      <Text variant="title.m">
        {t("match.trophies", { delta: formatTrophyDelta(end.trophies.delta) })}
      </Text>
      <View style={styles.endMaps}>{maps}</View>
      <Button testID="match-to-arena" label={t("search.toArena")} onPress={onLeave} />
    </View>
  );
};

export default EndOverlay;
