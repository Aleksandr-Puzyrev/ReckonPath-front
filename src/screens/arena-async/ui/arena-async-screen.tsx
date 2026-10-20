import { useKeepAwake } from "expo-keep-awake";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";

import { useConfigNumber } from "@entities/app-config";
import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { Screen } from "@shared/ui/screen";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { BoardRemote } from "@widgets/board";

import { useArenaAsync } from "../model/use-arena-async";

import { styles } from "./arena-async-styles";
import AuthorCard from "./author-card";
import MyAsyncBar from "./my-async-bar";

// Part 6 §7.4 default when remote config lacks it (значение Части 6 §7.4, если его нет в remote config).
const DEFAULT_MAX_TURNS = 40;

const ArenaAsyncScreen = () => {
  useKeepAwake();
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const game = useArenaAsync(showToast);
  const maxTurns = useConfigNumber("arena.maxTurns", DEFAULT_MAX_TURNS);
  const { match, handleSurrenderOpen } = game;

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleSurrenderOpen();
      return true;
    });
    return () => subscription.remove();
  }, [handleSurrenderOpen]);

  if (match === null || game.layout === null) return <Screen style={styles.screen} />;

  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setBoardWidth(nativeEvent.layout.width);

  return (
    <Screen style={styles.screen}>
      <AuthorCard nickname={match.author.nickname} league={match.author.league} norm={match.norm} />
      <View style={styles.banner}>
        <Text variant="eyebrow" style={styles.bannerText}>
          {t("match.yourTurn")}
        </Text>
      </View>
      <View testID="async-board-area" style={styles.boardArea} onLayout={handleLayout}>
        {boardWidth === 0 ? null : (
          <BoardRemote
            layout={game.layout}
            size={boardWidth}
            fx={game.fx}
            taps={game.taps}
            flags={game.flags}
            pendingCell={game.pendingCell}
            isDimmed={false}
            onCellPress={game.handleCellPress}
            onCellLongPress={game.handleCellLongPress}
          />
        )}
      </View>
      <Text variant="caption" style={styles.turnLine}>
        {t("match.turn", { n: game.turnsUsed + 1, max: maxTurns })}
      </Text>
      <MyAsyncBar
        deadline={game.deadline}
        turnSec={match.turnSec}
        status={`${t("match.myFound", { found: game.found, total: match.targetsCount })} · ${t("match.bombs", { count: match.bombCount })}`}
      />
      <View style={styles.controls}>
        <View style={styles.flex}>
          <Button
            testID="async-flag"
            label={t("match.flag")}
            variant={game.isFlagMode ? "primary" : "secondary"}
            size="m"
            onPress={game.handleFlagMode}
          />
        </View>
        <View style={styles.flex}>
          <Button
            testID="async-menu"
            label={t("match.menu")}
            variant="secondary"
            size="m"
            onPress={() => game.handleMenu(true)}
          />
        </View>
      </View>
      <Sheet isOpen={game.isMenuOpen} onDismiss={() => game.handleMenu(false)}>
        <View style={styles.menu}>
          <Button
            testID="async-surrender"
            label={t("match.surrender.action")}
            variant="danger"
            onPress={game.handleSurrenderOpen}
          />
        </View>
      </Sheet>
      <Dialog
        isOpen={game.isSurrenderOpen}
        title={t("match.surrender.confirm", { count: game.surrenderLoss })}
        onCancel={game.handleSurrenderClose}
        actions={[
          {
            label: t("match.surrender.cancel"),
            variant: "secondary",
            onPress: game.handleSurrenderClose,
          },
          { label: t("match.surrender.action"), variant: "danger", onPress: game.handleSurrender },
        ]}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaAsyncScreen;
