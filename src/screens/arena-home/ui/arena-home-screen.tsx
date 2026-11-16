import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { levelOfMap, NEW_MAP_ID } from "@entities/arena-map";
import type { ArenaMap } from "@entities/arena-map";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { stepLabelOf } from "@widgets/arena-hero";
import { BoardMapPreview } from "@widgets/board";
import { EarnSheet } from "@widgets/earn-sheet";
import { MapSwitchSheet } from "@widgets/my-arena-map";
import { TopBar } from "@widgets/top-bar";

import { useArenaHome } from "../model/use-arena-home";

import ArenaHomeBody from "./arena-home-body";
import SeasonSummary from "./season-summary";
import { styles } from "./arena-home-styles";

const renderMap = (map: ArenaMap, size: number) => (
  <BoardMapPreview key={map.id} level={levelOfMap(map.map)} taps={[]} size={size} />
);

const ArenaHomeScreen = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const home = useArenaHome((messageKey) => showToast(t(messageKey)));
  const { arena } = home;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <TopBar onWalletPress={home.handleWalletPress} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <ArenaHomeBody home={home} renderMap={renderMap} onMessage={showToast} />
      </ScrollView>
      {arena === undefined ? null : (
        <MapSwitchSheet
          isOpen={home.isSwitchOpen}
          maps={home.maps}
          maxMaps={home.maxMaps}
          formatLabel={t("arena.maps.format", {
            size: `${arena.league.format.rows}×${arena.league.format.cols}`,
            league: stepLabelOf(arena.league),
          })}
          isDisabled={!home.isOnline || home.isActivating}
          renderMap={renderMap}
          onSelect={home.handleActivate}
          onEdit={() => home.handleEditMap(home.activeMap?.id ?? NEW_MAP_ID)}
          onNewMap={() => home.handleEditMap(NEW_MAP_ID)}
          onDismiss={home.handleSwitchClose}
        />
      )}
      <EarnSheet
        isOpen={home.isEarnOpen}
        shortBy={null}
        onDaily={() => {
          home.handleEarnClose();
          router.push("/daily");
        }}
        onMessage={(messageKey) => showToast(t(messageKey))}
        onClose={home.handleEarnClose}
      />
      {home.seasonResult === null || arena?.season === undefined ? null : (
        <SeasonSummary
          result={home.seasonResult}
          nextSeason={arena.season.number}
          onError={(messageKey) => showToast(t(messageKey))}
        />
      )}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaHomeScreen;
