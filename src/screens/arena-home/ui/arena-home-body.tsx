import { router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { NEW_MAP_ID } from "@entities/arena-map";
import type { ArenaMap } from "@entities/arena-map";
import { openPlayerProfile } from "@entities/player";
import { HAS_ARENA_SERVER } from "@shared/config";
import { formatClockTime } from "@shared/lib";
import { Text } from "@shared/ui/text";
import { ArenaHero } from "@widgets/arena-hero";
import { ArenaLeaders } from "@widgets/arena-leaders";
import { BanNotice } from "@widgets/ban-notice";
import { MatchHistory } from "@widgets/match-history";
import { MyMapCard } from "@widgets/my-arena-map";
import { SeasonTrack } from "@widgets/season-track";

import type { useArenaHome } from "../model/use-arena-home";

import ArenaHomeStatus from "./arena-home-status";
import { styles } from "./arena-home-styles";
import ArenaLocked from "./arena-locked";
import FightBlock from "./fight-block";

interface IArenaHomeBody {
  home: ReturnType<typeof useArenaHome>;
  renderMap: (map: ArenaMap, size: number) => ReactNode;
  onMessage: (text: string) => void;
}

const ArenaHomeBody = ({ home, renderMap, onMessage }: IArenaHomeBody) => {
  const { t, i18n } = useTranslation();
  const { arena } = home;

  if (!HAS_ARENA_SERVER) {
    return (
      <Text variant="body.m" style={styles.message} testID="arena-server-only">
        {t("arena.serverOnly")}
      </Text>
    );
  }
  if (!home.isUnlocked) {
    return (
      <ArenaLocked
        passed={home.passed}
        unlockLevel={home.unlockLevel}
        onToLevels={() => router.navigate("/levels")}
      />
    );
  }
  if (home.ban !== null) {
    return (
      <BanNotice
        ban={home.ban}
        onCampaign={() => router.navigate("/levels")}
        onMessage={onMessage}
      />
    );
  }
  if (arena === undefined) {
    return (
      <ArenaHomeStatus
        isPending={home.isPending}
        isOnline={home.isOnline}
        error={home.error}
        onRetry={home.handleRetry}
      />
    );
  }
  return (
    <>
      {home.isOnline ? null : (
        <Text variant="body.s" style={styles.offline} testID="arena-offline">
          {t("arena.offline", {
            time: formatClockTime(new Date(home.updatedAt).toISOString(), i18n.language),
          })}
        </Text>
      )}
      <ArenaHero arena={arena} now={home.now} />
      <FightBlock
        format={arena.league.format}
        isOnline={home.isOnline}
        canFight={home.canFight}
        onFight={home.find.handleFight}
        onMapMatch={home.find.handleMapMatch}
      />
      <MyMapCard
        map={home.activeMap}
        canSwitch={home.isOnline && home.maps.length > 0}
        renderMap={renderMap}
        onSwitch={home.handleSwitchOpen}
        onEdit={() => home.handleEditMap(home.activeMap?.id ?? NEW_MAP_ID)}
        onCreate={() => home.handleEditMap(NEW_MAP_ID)}
      />
      {arena.season === undefined ? null : (
        <SeasonTrack
          rp={arena.season.rp}
          steps={arena.season.track}
          isOnline={home.isOnline}
          pendingStep={home.pendingStep}
          onClaim={home.handleClaim}
        />
      )}
      <ArenaLeaders
        isOnline={home.isOnline}
        onOpenAll={() => router.push("/leaderboards")}
        onOpenProfile={openPlayerProfile}
      />
      {arena.history.length === 0 ? null : (
        <MatchHistory
          matches={arena.history}
          onOpen={(id) => router.push({ pathname: "/arena/history/[id]", params: { id } })}
        />
      )}
    </>
  );
};

export default ArenaHomeBody;
