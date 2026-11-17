import { useTranslation } from "react-i18next";

import type { DailyGame, DayPlace } from "@entities/daily";
import { formatDayMonth } from "@shared/lib";
import { Dialog } from "@shared/ui/dialog";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import { DailyResultSheet } from "@widgets/daily-result";
import { LoseSheet } from "@widgets/level-result";
import { PauseSheet } from "@widgets/pause-menu";

import { useDailyPlay } from "../model/use-daily-play";

import DailyAttempt from "./daily-attempt";
import PlayField from "./play-field";
import PlayGuides from "./play-guides";
import { styles } from "./play-screen-styles";
import RetryBar from "./retry-bar";

interface IDailyPlay {
  game: DailyGame;
  place: DayPlace | null;
  onRestart: () => void;
}

const DailyPlay = ({ game, place, onRestart }: IDailyPlay) => {
  const { t, i18n } = useTranslation();
  const play = useDailyPlay({ game, onRestart });
  const { view, guides, overlay } = play;

  return (
    <Screen style={styles.screen}>
      <PlayField
        title={t("daily.title")}
        eyebrow={formatDayMonth(game.date, i18n.language)}
        view={view}
        flags={play.flags}
        fx={play.fx}
        guides={guides}
        isFlagMode={play.isFlagMode}
        isDeclined={false}
        notice={
          play.isTapFailed ? (
            <RetryBar isPending={play.isTapPending} onRetry={play.handleRetryTap} />
          ) : (
            <DailyAttempt attempt={game.attempt} />
          )
        }
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
        onResume={play.handleResume}
        onRestart={play.handleRestartRequest}
        onRules={play.handleRules}
        onExit={play.handleExit}
      />
      {game.result === undefined || game.status !== "won" ? null : (
        <DailyResultSheet
          isOpen={overlay === "win"}
          result={game.result}
          limit={view.moveLimit}
          place={place}
          onHome={play.handleHome}
        />
      )}
      <LoseSheet
        isOpen={overlay === "lose"}
        isBombLoss={play.isBombLoss}
        found={view.foundCount}
        total={view.targetCount}
        continueOptions={null}
        onRestart={play.handleRestart}
        onDecline={play.handleExit}
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
      <Toast message={play.toast} onHide={play.handleToastHide} />
      <PlayGuides fog={view.rules.fog} guides={guides} />
    </Screen>
  );
};

export default DailyPlay;
