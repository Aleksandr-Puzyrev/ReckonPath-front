import { useKeepAwake } from "expo-keep-awake";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { levelOfMap } from "@entities/arena-map";
import { Dialog } from "@shared/ui/dialog";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { BoardMapPreview, BoardRemote } from "@widgets/board";

import { useArenaMatch } from "../model/use-arena-match";
import { useMatchEffects } from "../model/use-match-effects";

import { styles } from "./arena-match-styles";
import MatchControls from "./match-controls";
import MatchSheets from "./match-sheets";
import ReconnectOverlay from "./reconnect-overlay";
import TimedPlayerBar from "./timed-player-bar";
import TrainingHintCard from "./training-hint-card";
import TurnBanner from "./turn-banner";

const ArenaMatchScreen = () => {
  useKeepAwake();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const game = useArenaMatch();
  const { match } = game;
  const isMyTurn = match.current === "me";
  const { bubble } = useMatchEffects({
    event: match.event,
    emote: match.emote,
    emoteId: match.emoteId,
    isMuted: game.isMuted,
    phase: match.phase,
    matchId: match.matchId,
    isTraining: match.isTraining,
    onToast: showToast,
  });
  const { handleSurrenderOpen, trainingHint } = game;
  const isOver = match.phase === "ended";
  const isTraining = match.isTraining;

  // Training cannot be given up, so back does nothing there (тренировку нельзя сдать, поэтому «назад» в ней ничего не делает).
  useEffect(() => {
    if (isOver && !isTraining) return undefined;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!isTraining) handleSurrenderOpen();
      return true;
    });
    return () => subscription.remove();
  }, [isOver, isTraining, handleSurrenderOpen]);

  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setBoardWidth(nativeEvent.layout.width);
  const total = match.format?.targets ?? 0;
  const myMapLevel = game.myMap === null ? null : levelOfMap(game.myMap.map);

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <TimedPlayerBar
            side="opponent"
            nickname={
              isTraining
                ? `${t("training.mentor")} · ${t("training.header").toLocaleUpperCase()}`
                : (match.opponent?.nickname ?? "")
            }
            status={
              isTraining
                ? t("training.subtitle")
                : t("match.found", { found: match.found.opponent, total })
            }
            isOffline={match.opponentConnection !== "online"}
            bubble={bubble?.player === "opponent" ? t(`match.emote.${bubble.emote}`) : null}
          />
        </View>
        {myMapLevel === null ? null : (
          <BoardMapPreview
            level={myMapLevel}
            taps={game.opponentTaps}
            size={theme.sizes.arena.myMap}
          />
        )}
      </View>
      <TurnBanner text={game.banner} isMine={isMyTurn} />
      <View testID="match-board-area" style={styles.boardArea} onLayout={handleLayout}>
        {game.layout === null || boardWidth === 0 ? null : (
          <BoardRemote
            layout={game.layout}
            size={boardWidth}
            fx={game.fx}
            taps={game.myTaps}
            flags={game.flags}
            pendingCell={game.pendingCell}
            isDimmed={game.isDimmed}
            onCellPress={game.handleCellPress}
            onCellLongPress={game.handleCellLongPress}
          />
        )}
      </View>
      {trainingHint === null ? (
        <Text variant="caption" style={styles.turnLine}>
          {t("match.turn", { n: match.turn, max: match.format?.maxTurns ?? 0 })}
        </Text>
      ) : (
        <TrainingHintCard hint={trainingHint} onNext={game.handleTrainingNext} />
      )}
      <TimedPlayerBar
        side="me"
        nickname={game.me?.nickname ?? ""}
        status={[
          t("match.myFound", { found: match.found.me, total }),
          isTraining ? t("training.noSurrender") : t("match.bombs", { count: match.opponentBombs }),
        ].join(" · ")}
        isOffline={false}
        bubble={bubble?.player === "me" ? t(`match.emote.${bubble.emote}`) : null}
      />
      <MatchControls
        isFlagMode={game.isFlagMode}
        onEmotes={() => game.handleSheet("emotes")}
        onFlag={game.handleFlagMode}
        onMenu={() => game.handleSheet("menu")}
      />
      <MatchSheets
        sheet={game.sheet}
        isMuted={game.isMuted}
        onEmote={game.handleEmote}
        onMuteToggle={game.handleMuteToggle}
        canSurrender={!isTraining}
        onSurrender={game.handleSurrenderOpen}
        onClose={() => game.handleSheet(null)}
      />
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
      {match.isReconnecting && !isOver ? <ReconnectOverlay /> : null}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaMatchScreen;
