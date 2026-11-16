import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { levelOfBoard, PrepareTimer } from "@entities/match";
import type { MatchView } from "@entities/match";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { BoardMapPreview } from "@widgets/board";

import { styles } from "./arena-match-styles";

interface IPrepareView {
  view: MatchView;
  activeMapId: string | null;
  isPending: boolean;
  onSaved: (mapId: string) => void;
  onRandom: () => void;
  onDraw: () => void;
  onReady: () => void;
  onSurrender: () => void;
}

const PrepareView = ({
  view,
  activeMapId,
  isPending,
  onSaved,
  onRandom,
  onDraw,
  onReady,
  onSurrender,
}: IPrepareView) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { me, rival, myMap } = view;
  const canChoose = !me.ready && !isPending;

  return (
    <ScrollView contentContainerStyle={styles.prepare} testID="prepare">
      <Text variant="display.m" accessibilityRole="header" style={styles.centered}>
        {t("prepare.title")}
      </Text>
      <PrepareTimer deadline={view.deadline} />
      <View style={styles.prepareMap}>
        <Text variant="eyebrow" style={styles.secondary}>
          {t("search.myMap")}
        </Text>
        {myMap === undefined ? null : (
          <BoardMapPreview
            testID="prepare-map"
            level={levelOfBoard(myMap)}
            taps={[]}
            size={theme.sizes.arena.detailsMap}
          />
        )}
        {view.mapSeenByRival === true ? (
          <Text variant="body.s" style={styles.secondary} testID="prepare-seen">
            {t("prepare.seen")}
          </Text>
        ) : null}
      </View>
      <View style={styles.prepareSources}>
        <View style={styles.control}>
          <Button
            testID="prepare-saved"
            label={t("prepare.saved")}
            variant="secondary"
            size="s"
            isDisabled={!canChoose || activeMapId === null}
            onPress={() => {
              if (activeMapId !== null) onSaved(activeMapId);
            }}
          />
        </View>
        <View style={styles.control}>
          <Button
            testID="prepare-random"
            label={t("prepare.random")}
            variant="secondary"
            size="s"
            isDisabled={!canChoose}
            onPress={onRandom}
          />
        </View>
        <View style={styles.control}>
          <Button
            testID="prepare-draw"
            label={t("prepare.draw")}
            variant="secondary"
            size="s"
            isDisabled={!canChoose}
            onPress={onDraw}
          />
        </View>
      </View>
      <Text variant="caption" style={[styles.secondary, styles.centered]}>
        {t("prepare.auto")}
      </Text>
      {rival.ready ? (
        <Text variant="body.m" style={styles.centered} testID="prepare-rival-ready">
          {t("prepare.rivalReady")}
        </Text>
      ) : null}
      <Button
        testID="prepare-ready"
        label={me.ready ? t("prepare.waiting") : t("prepare.ready")}
        size="l"
        isDisabled={!canChoose}
        onPress={onReady}
      />
      <Button
        testID="prepare-surrender"
        label={t("match.surrender.action")}
        variant="ghost"
        onPress={onSurrender}
      />
    </ScrollView>
  );
};

export default PrepareView;
