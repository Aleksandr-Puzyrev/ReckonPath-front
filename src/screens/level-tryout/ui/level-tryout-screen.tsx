import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { HudCounter } from "@shared/ui/hud-counter";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { BoardLocal } from "@widgets/board";
import { hudValuesOf } from "@widgets/hud";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { useLevelTryout } from "../model/use-level-tryout";

import { styles } from "./level-tryout-styles";
import TryoutResult from "./tryout-result";

const LevelTryoutScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { c: code } = useLocalSearchParams<{ c?: string }>();
  const tryout = useLevelTryout(code);
  const [boardSize, setBoardSize] = useState(0);
  const iconSize = theme.sizes.iconButton.icon;
  const { game } = tryout;
  const values = game === null ? null : hudValuesOf(game);
  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setBoardSize(Math.min(nativeEvent.layout.width, nativeEvent.layout.height));

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="tryout-back"
          accessibilityLabel={t("common.back")}
          onPress={tryout.handleBack}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" style={styles.title} numberOfLines={1} accessibilityRole="header">
          {tryout.title}
        </Text>
      </View>
      {values === null ? null : (
        <View style={styles.counters}>
          <View style={styles.counter}>
            <HudCounter
              label={t("play.hud.moves")}
              value={
                values.limit === null
                  ? String(values.movesUsed)
                  : `${values.movesLeft} / ${values.limit}`
              }
            />
          </View>
          <View style={styles.counter}>
            <HudCounter
              label={t("play.hud.targets")}
              value={`${values.found} / ${values.targets}`}
            />
          </View>
        </View>
      )}
      <View testID="tryout-board-area" style={styles.boardArea} onLayout={handleLayout}>
        {game === null || boardSize === 0 ? null : (
          <BoardLocal
            game={game}
            size={boardSize}
            fx={tryout.fx}
            lastCell={tryout.lastCell}
            isHiddenShown={tryout.isAuthor}
            onCellPress={tryout.handleCellPress}
          />
        )}
      </View>
      {game === null || game.status === "playing" ? null : (
        <TryoutResult
          status={game.status}
          moves={game.movesUsed}
          challenge={tryout.challenge}
          isAuthor={tryout.isAuthor}
          onAgain={tryout.handleRestart}
          onBack={tryout.isAuthor ? tryout.handleBack : tryout.handleLevels}
        />
      )}
    </Screen>
  );
};

export default LevelTryoutScreen;
