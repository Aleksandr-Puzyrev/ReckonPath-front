import { useTranslation } from "react-i18next";

import type { CampaignGame, CampaignLevel } from "@entities/level";
import { CampaignContinueOptions } from "@features/continue-game";
import { Dialog } from "@shared/ui/dialog";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import { EarnSheet } from "@widgets/earn-sheet";
import { LoseSheet, WinSheet } from "@widgets/level-result";
import { PauseSheet } from "@widgets/pause-menu";

import { useCampaignPlay } from "../model/use-campaign-play";

import PlayField from "./play-field";
import PlayGuides from "./play-guides";
import { styles } from "./play-screen-styles";
import RetryBar from "./retry-bar";

interface ICampaignPlay {
  level: CampaignLevel;
  game: CampaignGame;
  isResuming: boolean;
  onRestart: () => void;
}

const CampaignPlay = ({ level, game, isResuming, onRestart }: ICampaignPlay) => {
  const { t } = useTranslation();
  const play = useCampaignPlay({ level, game, isResuming, onRestart });
  const { view, guides, overlay, flags } = play;
  const { result } = game;

  return (
    <Screen style={styles.screen}>
      <PlayField
        title={t("home.level", { n: level.number })}
        view={view}
        flags={flags}
        fx={play.fx}
        guides={guides}
        isFlagMode={play.isFlagMode}
        isDeclined={overlay === "declined"}
        notice={
          play.isTapFailed ? (
            <RetryBar isPending={play.isTapPending} onRetry={play.handleRetryTap} />
          ) : null
        }
        onPause={play.handlePause}
        onRestartRequest={play.handleRestartRequest}
        onRestart={play.handleRestart}
        onExit={play.handleExit}
        onTutorialSkip={play.handleTutorialSkip}
        onCellPress={play.handleCellPress}
        onCellLongPress={play.handleCellLongPress}
        onToggleFlagMode={play.handleToggleFlagMode}
      />
      <PauseSheet
        isOpen={overlay === "pause"}
        onResume={play.handleResume}
        onRestart={play.handleRestart}
        onRules={play.handleRules}
        onExit={play.handleExit}
      />
      {game.status === "won" && result !== undefined ? (
        <WinSheet
          isOpen={overlay === "win"}
          levelNumber={level.number}
          result={result}
          limit={view.moveLimit}
          isContinued={view.continued}
          isTutorial={guides.isTutorialLevel}
          onNext={play.handleNext}
          onAgain={play.handleRestart}
          onExit={play.handleExit}
        />
      ) : null}
      <LoseSheet
        isOpen={overlay === "lose"}
        isBombLoss={play.isBombLoss}
        found={view.foundCount}
        total={view.targetCount}
        continueOptions={
          result?.canContinue === true ? (
            <CampaignContinueOptions
              game={game}
              onContinued={play.handleContinued}
              onShortOfEmeralds={play.handleShortOfEmeralds}
              onError={play.handleContinueError}
            />
          ) : null
        }
        onRestart={play.handleRestart}
        onDecline={play.handleDecline}
        onExit={play.handleExit}
      />
      <Dialog
        isOpen={overlay === "restartConfirm"}
        title={t("play.restartConfirm")}
        onCancel={play.handleResume}
        actions={[
          { label: t("common.cancel"), variant: "secondary", onPress: play.handleResume },
          { label: t("play.restartAction"), variant: "danger", onPress: play.handleRestart },
        ]}
      />
      <Dialog
        isOpen={overlay === "resume"}
        title={t("play.resumeTitle")}
        onCancel={play.handleResume}
        actions={[
          { label: t("play.pause.restart"), variant: "secondary", onPress: play.handleRestart },
          { label: t("home.continue"), variant: "primary", onPress: play.handleResume },
        ]}
      />
      <EarnSheet
        isOpen={play.earnShortBy !== null}
        shortBy={play.earnShortBy}
        onDaily={play.handleEarnDaily}
        onMessage={play.handleContinueError}
        onClose={play.handleEarnClose}
      />
      <Toast message={play.toast} onHide={play.handleToastHide} />
      <PlayGuides fog={view.rules.fog} guides={guides} />
    </Screen>
  );
};

export default CampaignPlay;
