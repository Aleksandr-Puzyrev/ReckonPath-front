import { useTranslation } from "react-i18next";

import { ContinueOptions } from "@features/continue-game";
import { formatDayMonth } from "@shared/lib";
import { Dialog } from "@shared/ui/dialog";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import { DailyResultSheet } from "@widgets/daily-result";
import { EarnSheet } from "@widgets/earn-sheet";
import { LoseSheet } from "@widgets/level-result";
import { PauseSheet } from "@widgets/pause-menu";

import { useDailyPlay } from "../model/use-daily-play";

import LevelUnavailable from "./level-unavailable";
import PlayField from "./play-field";
import PlayGuides from "./play-guides";
import { styles } from "./play-screen-styles";

interface IDailyPlay {
  id: string;
  isUnlocked: boolean;
  unlockLevel: number;
}

const DailyPlay = ({ id, isUnlocked, unlockLevel }: IDailyPlay) => {
  const { t, i18n } = useTranslation();
  const play = useDailyPlay(id, isUnlocked);
  const target = play.play;
  const { view, guides, overlay } = play;

  if (target.kind === "missing") {
    return <LevelUnavailable message={t("play.notFound")} onExit={play.handleExit} />;
  }
  if (target.kind === "dailyLocked") {
    return (
      <LevelUnavailable message={t("daily.locked", { n: unlockLevel })} onExit={play.handleExit} />
    );
  }
  if (view === null) return <Screen style={styles.screen} />;

  return (
    <Screen style={styles.screen}>
      <PlayField
        title={t("daily.title")}
        eyebrow={formatDayMonth(target.dayKey, i18n.language)}
        view={view}
        flags={play.flags}
        fx={play.fx}
        guides={guides}
        isFlagMode={play.isFlagMode}
        isDeclined={overlay === "declined"}
        onPause={play.handlePause}
        onRestartRequest={play.handleRestartRequest}
        onRestart={play.handleRestart}
        onExit={play.handleExit}
        onTutorialSkip={play.handleExit}
        onCellPress={play.handleCellPress}
        onCellLongPress={play.handleCellLongPress}
        onToggleFlagMode={play.handleToggleFlagMode}
      />
      <PauseSheet
        isOpen={overlay === "pause"}
        note={t("daily.pauseNote")}
        onResume={play.handleResume}
        onRestart={play.handleRestartRequest}
        onRules={play.handleRules}
        onExit={play.handleExit}
      />
      <DailyResultSheet
        isOpen={overlay === "win"}
        dayKey={target.dayKey}
        attempt={play.lastAttempt}
        onAgain={play.handleRestart}
        onHome={play.handleHome}
      />
      <LoseSheet
        isOpen={overlay === "lose"}
        isBombLoss={play.isBombLoss}
        found={view.foundCount}
        total={view.targetCount}
        continueOptions={
          play.canContinue ? (
            <ContinueOptions
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
        title={play.isCountedRestart ? t("daily.restartTitle") : t("play.restartConfirm")}
        message={play.isCountedRestart ? t("daily.restartCounted") : undefined}
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

export default DailyPlay;
