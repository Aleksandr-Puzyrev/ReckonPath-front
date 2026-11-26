import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { uuidv7 } from "uuidv7";

import { applyTap, stars, toCell, toIdx } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { hapticsForEvents } from "@features/tap-cell";
import { playViewOfGame, startGame } from "@entities/level";
import {
  canResumeOffline,
  decryptOfflineLevel,
  isPackCurrent,
  nextOfflineLevel,
  offlineNow,
  useOfflineCampaign,
} from "@entities/offline-campaign";
import type { CampaignPack, OfflineAttempt } from "@entities/offline-campaign";
import { haptic } from "@shared/haptics";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { AnswerPanel } from "@widgets/answer-panel";
import { Board, useBoardFx } from "@widgets/board";
import { Hud } from "@widgets/hud";

import LevelUnavailable from "./level-unavailable";
import { styles } from "./play-screen-styles";

const MIN_TAP_MS = 200;

const exit = () => {
  if (router.canGoBack()) router.back();
  else router.replace("/levels");
};

interface IOfflinePlay {
  entry: CampaignPack["levels"][number];
  pack: CampaignPack;
  title: string;
  level: LevelInput;
}

const OfflinePlay = ({ entry, pack, title, level }: IOfflinePlay) => {
  const { t } = useTranslation();
  const { packId } = pack;
  const makeAttempt = (): OfflineAttempt => ({
    id: uuidv7(),
    packId,
    level: entry.number,
    version: entry.version,
    startedAt: new Date(offlineNow(pack)).toISOString(),
    taps: [],
  });
  const [attempt, setAttempt] = useState(() => {
    const active = useOfflineCampaign.getState().active;
    return active?.packId === packId && active.level === entry.number ? active : makeAttempt();
  });
  useEffect(() => {
    const storage = useOfflineCampaign.getState();
    if (attempt.taps.length === 0 && storage.active === null && storage.pack?.packId === packId)
      storage.save(attempt);
  }, [attempt, packId]);

  const [game, setGame] = useState(() =>
    attempt.taps.reduce(
      (state, cell) => applyTap(state, toIdx(state.board.cols, cell)).state,
      startGame(level),
    ),
  );
  const [flags, setFlags] = useState<Idx[]>([]);
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [size, setSize] = useState(0);
  const fx = useBoardFx();
  const last = attempt.taps.at(-1);
  const view = playViewOfGame(game, last === undefined ? null : toIdx(game.board.cols, last));

  const toggleFlag = (idx: Idx) => {
    if (game.status !== "playing" || game.revealed.has(idx)) return;
    setFlags((current) =>
      current.includes(idx) ? current.filter((cell) => cell !== idx) : [...current, idx],
    );
  };

  const tap = (idx: Idx) => {
    if (isFlagMode) {
      toggleFlag(idx);
      return;
    }
    if (flags.includes(idx) || game.status !== "playing") return;
    if (!canResumeOffline(pack)) {
      exit();
      return;
    }
    const storage = useOfflineCampaign.getState();
    if (
      storage.pack?.packId !== packId ||
      storage.active?.id !== attempt.id ||
      storage.active.taps.length !== attempt.taps.length
    )
      return;
    const elapsed = offlineNow(pack) - Date.parse(attempt.startedAt);
    if (elapsed < (attempt.taps.length + 1) * MIN_TAP_MS) return;
    const { state, events } = applyTap(game, idx);
    if (state !== game) fx.tap(idx);
    fx.play(idx, events);
    haptic(...hapticsForEvents(events));
    if (state === game) return;
    const [row, col] = toCell(game.board.cols, idx);
    const updated: OfflineAttempt = { ...attempt, taps: [...attempt.taps, [row, col]] };
    if (state.status === "playing") storage.save(updated);
    else
      storage.finish({
        ...updated,
        won: state.status === "won",
        finishedAt: new Date(offlineNow(pack)).toISOString(),
      });
    setAttempt(updated);
    setGame(state);
  };

  const restart = () => {
    const pack = useOfflineCampaign.getState().pack;
    if (pack === null || pack.packId !== packId || !isPackCurrent(pack)) {
      exit();
      return;
    }
    const fresh = makeAttempt();
    useOfflineCampaign.getState().save(fresh);
    setAttempt(fresh);
    setGame(startGame(level));
    setFlags([]);
    setIsFlagMode(false);
  };

  return (
    <Screen style={styles.screen}>
      <Button label={t("common.back")} onPress={exit} />
      <Text variant="title.m" accessibilityRole="header">
        {title || t("home.level", { n: entry.number })}
      </Text>
      <Text variant="eyebrow">{t("offlineCampaign.title")}</Text>
      <Hud view={view} onModeInfo={() => setShowModeInfo((visible) => !visible)} />
      {showModeInfo && (
        <Text variant="body.s">
          {t(
            `competition.modes.${game.rules.probeMode === "distance" ? "number" : game.rules.probeMode === "direction" ? "course" : "hot_cold"}`,
          )}
        </Text>
      )}
      <View
        style={styles.boardArea}
        onLayout={({ nativeEvent: { layout } }) => setSize(Math.min(layout.width, layout.height))}
      >
        {size > 0 && (
          <Board
            view={view}
            flags={flags}
            size={size}
            fx={fx}
            hasEquippedEffects
            showHidden={false}
            onCellPress={tap}
            onCellLongPress={toggleFlag}
          />
        )}
      </View>
      {game.status === "playing" ? (
        <AnswerPanel
          view={view}
          isFlagMode={isFlagMode}
          onToggleFlagMode={() => setIsFlagMode((enabled) => !enabled)}
        />
      ) : (
        <>
          <Text variant="title.m" accessibilityLiveRegion="polite">
            {t(game.status === "won" ? "result.win.title" : "result.lose.title")}
          </Text>
          {game.status === "won" ? (
            <>
              <Text variant="body.s">{t("result.stars", { count: stars(game) ?? 0 })}</Text>
              <Text variant="body.s">{t("offlineCampaign.pendingReward")}</Text>
              <Button label={t("offlineCampaign.toLevels")} variant="primary" onPress={exit} />
            </>
          ) : (
            <Button label={t("play.restartAction")} variant="primary" onPress={restart} />
          )}
        </>
      )}
    </Screen>
  );
};

type Loading =
  | { kind: "loading" }
  | { kind: "error" }
  | {
      kind: "ready";
      value: Awaited<ReturnType<typeof decryptOfflineLevel>>;
    };

const DownloadedLevel = ({ entry, pack }: { entry: IOfflinePlay["entry"]; pack: CampaignPack }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<Loading>({ kind: "loading" });
  useEffect(() => {
    let cancelled = false;
    void decryptOfflineLevel(pack.packId, entry).then(
      (value) => {
        if (!cancelled) setLoading({ kind: "ready", value });
      },
      () => {
        if (!cancelled) setLoading({ kind: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [entry, pack.packId]);
  if (loading.kind === "error")
    return <LevelUnavailable message={t("offlineCampaign.unavailable")} onExit={exit} />;
  if (loading.kind === "loading")
    return (
      <Screen style={styles.screen}>
        <ActivityIndicator accessibilityLabel={t("competition.loading")} />
      </Screen>
    );
  return <OfflinePlay entry={entry} pack={pack} {...loading.value} />;
};

const OfflineCampaignLevel = ({ number }: { number: number }) => {
  const { t } = useTranslation();
  // Freeze the admitted pack so finishing or syncing a result cannot unmount its result panel.
  const [selected] = useState(() => {
    const { owner, pack, pending, active } = useOfflineCampaign.getState();
    if (owner === null || pack === null) return null;
    const resumes =
      active?.level === number && active.packId === pack.packId && canResumeOffline(pack);
    if (!resumes && (!isPackCurrent(pack) || nextOfflineLevel(pack, pending) !== number))
      return null;
    const entry = pack.levels.find((level) => level.number === number);
    return entry === undefined ? null : { entry, pack };
  });

  if (selected === null)
    return <LevelUnavailable message={t("offlineCampaign.unavailable")} onExit={exit} />;
  return <DownloadedLevel {...selected} />;
};

export default OfflineCampaignLevel;
