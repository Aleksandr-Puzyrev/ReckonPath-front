import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { LayoutChangeEvent } from "react-native";

import { CoachMark } from "@shared/ui/coach-mark";
import { Dialog } from "@shared/ui/dialog";
import { Screen } from "@shared/ui/screen";
import { AnswerPanel } from "@widgets/answer-panel";
import { Board } from "@widgets/board";
import { Hud } from "@widgets/hud";
import { LoseSheet, WinSheet } from "@widgets/level-result";
import { PauseSheet } from "@widgets/pause-menu";

import { usePlayScreen } from "../model/use-play-screen";

import DeclinedBar from "./declined-bar";
import LevelUnavailable from "./level-unavailable";
import PlayGuides from "./play-guides";
import PlayHeader from "./play-header";
import { styles } from "./play-screen-styles";
import TutorialCoach from "./tutorial-coach";

interface IPlayLevel {
  mode: string;
  id: string;
}

const PlayLevel = ({ mode, id }: IPlayLevel) => {
  const { t } = useTranslation();
  const play = usePlayScreen(mode, id);
  const [boardSize, setBoardSize] = useState(0);

  if (play.campaign === null) {
    return <LevelUnavailable message={t("play.notFound")} onExit={play.handleExit} />;
  }
  if (play.lockedBy !== null) {
    return (
      <LevelUnavailable
        message={t("levels.locked", { n: play.lockedBy })}
        onExit={play.handleExit}
      />
    );
  }
  const { level, number } = play.campaign;

  const handleBoardLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    setBoardSize(Math.min(nativeEvent.layout.width, nativeEvent.layout.height));

  return (
    <Screen style={styles.screen}>
      <PlayHeader
        levelNumber={number}
        onPause={play.handlePause}
        onRestart={play.handleRestartRequest}
      />
      <Hud onModeInfo={play.guides.handleModeInfo} />
      {play.guides.isMovesHintOpen ? (
        <CoachMark
          text={t("onboarding.movesLimit")}
          action={{ label: t("rules.gotIt"), onPress: play.guides.handleMovesHintClose }}
        />
      ) : null}
      <View testID="board-area" style={styles.boardArea} onLayout={handleBoardLayout}>
        {boardSize > 0 ? (
          <Board
            size={boardSize}
            fx={play.fx}
            showHidden={play.overlay === "declined"}
            highlight={play.guides.highlight}
            onCellPress={play.handleCellPress}
            onCellLongPress={play.handleCellLongPress}
          />
        ) : null}
      </View>
      {play.guides.tutorialStep !== null ? (
        <TutorialCoach
          step={play.guides.tutorialStep}
          canSkip={play.guides.canSkipTutorial}
          onNext={play.guides.handleTutorialNext}
          onSkip={play.handleTutorialSkip}
        />
      ) : null}
      {play.overlay === "declined" ? (
        <DeclinedBar onRestart={play.handleRestart} onExit={play.handleExit} />
      ) : null}
      {play.overlay === "declined" || play.guides.canSkipTutorial ? null : (
        <AnswerPanel isFlagMode={play.isFlagMode} onToggleFlagMode={play.handleToggleFlagMode} />
      )}

      <PauseSheet
        isOpen={play.overlay === "pause"}
        onResume={play.handleResume}
        onRestart={play.handleRestart}
        onRules={play.handleRules}
        onExit={play.handleExit}
      />
      <WinSheet
        isOpen={play.overlay === "win"}
        levelId={level.id}
        levelNumber={number}
        isRecord={play.isRecord}
        isTutorial={play.guides.isTutorialLevel}
        hasNext={play.hasNext}
        onNext={play.handleNext}
        onAgain={play.handleRestart}
        onExit={play.handleExit}
      />
      <LoseSheet
        isOpen={play.overlay === "lose"}
        isBombLoss={play.isBombLoss}
        onContinued={play.handleContinued}
        onRestart={play.handleRestart}
        onDecline={play.handleDecline}
        onExit={play.handleExit}
      />
      <Dialog
        isOpen={play.overlay === "restartConfirm"}
        title={t("play.restartConfirm")}
        onCancel={play.handleResume}
        actions={[
          { label: t("common.cancel"), variant: "secondary", onPress: play.handleResume },
          { label: t("play.restartAction"), variant: "danger", onPress: play.handleRestart },
        ]}
      />
      <Dialog
        isOpen={play.overlay === "resume"}
        title={t("play.resumeTitle")}
        onCancel={play.handleResume}
        actions={[
          { label: t("play.pause.restart"), variant: "secondary", onPress: play.handleRestart },
          { label: t("home.continue"), variant: "primary", onPress: play.handleResume },
        ]}
      />
      <PlayGuides level={level} guides={play.guides} />
    </Screen>
  );
};

// A new level gets fresh screen state even when the route is reused (новый уровень получает свежее состояние экрана, даже если маршрут переиспользуется).
const PlayScreen = () => {
  const { mode = "", id = "" } = useLocalSearchParams<{ mode: string; id: string }>();
  return <PlayLevel key={`${mode}/${id}`} mode={mode} id={id} />;
};

export default PlayScreen;
