import { router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { NEW_MAP_ID } from "@entities/arena-map";
import type { ArenaMap } from "@entities/arena-map";
import { formatClockTime } from "@shared/lib";
import { Text } from "@shared/ui/text";
import { ArenaHero } from "@widgets/arena-hero";
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
}

const ArenaHomeBody = ({ home, renderMap }: IArenaHomeBody) => {
  const { t, i18n } = useTranslation();
  const { arena } = home;

  if (!home.isUnlocked) {
    return <ArenaLocked passed={home.passed} onToLevels={() => router.navigate("/levels")} />;
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
      <ArenaHero profile={arena.profile} season={arena.season} now={home.now} />
      <FightBlock
        format={arena.format}
        isOnline={home.isOnline}
        canFight={home.canFight}
        onFight={home.find.handleFight}
      />
      <MyMapCard
        map={home.activeMap}
        canSwitch={home.isOnline && home.formatMaps.length > 0}
        renderMap={renderMap}
        onSwitch={home.handleSwitchOpen}
        onEdit={() => home.handleEditMap(home.activeMap?.id ?? NEW_MAP_ID)}
        onCreate={() => home.handleEditMap(NEW_MAP_ID)}
      />
      <SeasonTrack
        rp={arena.profile.rp}
        steps={arena.season.track}
        isOnline={home.isOnline}
        pendingStep={home.pendingStep}
        onClaim={home.handleClaim}
      />
      {home.matches.length === 0 ? null : (
        <MatchHistory
          matches={home.matches}
          onOpen={(id) => router.push({ pathname: "/arena/history/[id]", params: { id } })}
        />
      )}
    </>
  );
};

export default ArenaHomeBody;
