import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { LayoutChangeEvent } from "react-native";

import type { Idx } from "@reckon-path/engine";

import type { PlayView } from "@entities/level";
import { CoachMark } from "@shared/ui/coach-mark";
import { AnswerPanel } from "@widgets/answer-panel";
import { Board } from "@widgets/board";
import type { BoardFx } from "@widgets/board";
import { Hud } from "@widgets/hud";

import type { PlayGuides } from "../model/use-play-guides";

import BombCoach from "./bomb-coach";
import DeclinedBar from "./declined-bar";
import PlayHeader from "./play-header";
import { styles } from "./play-screen-styles";
import TutorialCoach from "./tutorial-coach";

interface IPlayField {
  title: string;
  eyebrow?: string;
  view: PlayView;
  flags: readonly Idx[];
  fx: BoardFx;
  guides: PlayGuides;
  isFlagMode: boolean;
  isDeclined: boolean;
  notice?: ReactNode;
  onPause: () => void;
  onRestartRequest: () => void;
  onRestart: () => void;
  onExit: () => void;
  onTutorialSkip: () => void;
  onCellPress: (cell: Idx) => void;
  onCellLongPress: (cell: Idx) => void;
  onToggleFlagMode: () => void;
}

const PlayField = ({
  title,
  eyebrow,
  view,
  flags,
  fx,
  guides,
  isFlagMode,
  isDeclined,
  notice = null,
  onPause,
  onRestartRequest,
  onRestart,
  onExit,
  onTutorialSkip,
  onCellPress,
  onCellLongPress,
  onToggleFlagMode,
}: IPlayField) => {
  const { t } = useTranslation();
  const [boardSize, setBoardSize] = useState(0);

  const handleBoardLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setBoardSize(Math.min(nativeEvent.layout.width, nativeEvent.layout.height));

  return (
    <>
      <PlayHeader title={title} eyebrow={eyebrow} onPause={onPause} onRestart={onRestartRequest} />
      <Hud view={view} onModeInfo={guides.handleModeInfo} />
      {guides.isMovesHintOpen ? (
        <CoachMark
          text={t("onboarding.movesLimit")}
          action={{ label: t("rules.gotIt"), onPress: guides.handleMovesHintClose }}
        />
      ) : null}
      <View testID="board-area" style={styles.boardArea} onLayout={handleBoardLayout}>
        {boardSize > 0 ? (
          <Board
            view={view}
            flags={flags}
            size={boardSize}
            fx={fx}
            showHidden={isDeclined}
            highlight={guides.highlight}
            onCellPress={onCellPress}
            onCellLongPress={onCellLongPress}
          />
        ) : null}
      </View>
      {guides.tutorialStep !== null ? (
        <TutorialCoach
          step={guides.tutorialStep}
          canSkip={guides.canSkipTutorial}
          onNext={guides.handleTutorialNext}
          onSkip={onTutorialSkip}
        />
      ) : null}
      {guides.isBombCoachOpen ? <BombCoach onClose={guides.handleBombCoachClose} /> : null}
      {isDeclined ? <DeclinedBar onRestart={onRestart} onExit={onExit} /> : null}
      {notice}
      {isDeclined || guides.canSkipTutorial ? null : (
        <AnswerPanel view={view} isFlagMode={isFlagMode} onToggleFlagMode={onToggleFlagMode} />
      )}
    </>
  );
};

export default PlayField;
