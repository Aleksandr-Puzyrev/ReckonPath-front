import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useConfigNumber } from "@entities/app-config";
import type { MatchView } from "@entities/match";
import { Text } from "@shared/ui/text";
import { BoardMapPreview, BoardRemote } from "@widgets/board";

import { bannerTextOf } from "../model/banner-text";
import { useArenaMatch } from "../model/use-arena-match";
import type { useMatchActions } from "../model/use-match-actions";

import { styles } from "./arena-match-styles";
import MatchControls from "./match-controls";
import TimedPlayerBar from "./timed-player-bar";
import TurnBanner from "./turn-banner";

interface IPlayView {
  view: MatchView;
  actions: ReturnType<typeof useMatchActions>;
  onMenu: () => void;
}

const MS_PER_SECOND = 1000;
const MAX_TURNS_KEY = "arena.maxTurns";

const PlayView = ({ view, actions, onMenu }: IPlayView) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [boardWidth, setBoardWidth] = useState(0);
  const maxTurns = useConfigNumber(MAX_TURNS_KEY, 0);
  const game = useArenaMatch(view, actions);
  const { me, rival, format } = view;
  const isMap = view.kind === "map";
  const turnMs = format.moveSeconds * MS_PER_SECOND;
  const gameMs = Date.parse(view.deadline) - Date.parse(view.startsAt ?? view.serverTime);
  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setBoardWidth(nativeEvent.layout.width);

  return (
    <>
      <View style={styles.top}>
        <View style={styles.flex}>
          <TimedPlayerBar
            side="opponent"
            nickname={rival.name}
            status={
              rival.bot === true
                ? t("vs.bot")
                : t("match.found", { found: rival.found, total: format.targets })
            }
            deadline={!isMap && view.turn === "rival" ? view.deadline : undefined}
            totalMs={turnMs}
          />
        </View>
        {game.myLevel === null ? null : (
          <BoardMapPreview
            testID="match-my-map"
            level={game.myLevel}
            taps={game.myMapTaps}
            size={theme.sizes.arena.myMap}
          />
        )}
      </View>
      <TurnBanner text={bannerTextOf(view, t)} isMine={game.isMyTurn} />
      {view.rivalOnline === false ? (
        <Text
          variant="caption"
          style={styles.turnLine}
          testID="rival-offline"
          accessibilityLiveRegion="polite"
        >
          {t("match.oppReconnecting")}
        </Text>
      ) : null}
      <View testID="match-board-area" style={styles.boardArea} onLayout={handleLayout}>
        {game.layout === null || boardWidth === 0 ? null : (
          <BoardRemote
            layout={game.layout}
            size={boardWidth}
            fx={game.fx}
            taps={game.taps}
            flags={game.flags}
            pendingCell={game.pendingCell}
            isDimmed={game.isDimmed}
            onCellPress={game.handleCellPress}
            onCellLongPress={game.handleCellLongPress}
          />
        )}
      </View>
      {isMap || maxTurns === 0 ? null : (
        <Text variant="caption" style={styles.turnLine}>
          {t("match.turn", { n: me.moves + rival.moves, max: maxTurns })}
        </Text>
      )}
      <TimedPlayerBar
        side="me"
        nickname={me.name}
        status={[
          t("match.myFound", { found: me.found, total: format.targets }),
          isMap ? t("async.bomb") : t("match.bombs", { count: view.rivalMap?.bombs ?? 0 }),
        ].join(" · ")}
        deadline={isMap || view.turn === "me" ? view.deadline : undefined}
        totalMs={isMap ? gameMs : turnMs}
      />
      <MatchControls isFlagMode={game.isFlagMode} onFlag={game.handleFlagMode} onMenu={onMenu} />
    </>
  );
};

export default PlayView;
