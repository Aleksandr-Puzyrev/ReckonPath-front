import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { NEW_MAP_ID } from "@entities/arena-map";
import type { ArenaMap } from "@entities/arena-map";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { leagueLabelOf } from "@widgets/arena-hero";
import { EarnSheet } from "@widgets/earn-sheet";
import { MapSwitchSheet } from "@widgets/my-arena-map";
import { TopBar } from "@widgets/top-bar";

import { useArenaHome } from "../model/use-arena-home";

import ArenaHomeBody from "./arena-home-body";
import ArenaMapPreview from "./arena-map-preview";
import { styles } from "./arena-home-styles";

const renderMap = (map: ArenaMap, size: number) => (
  <ArenaMapPreview key={map.id} map={map} size={size} />
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
        <ArenaHomeBody home={home} renderMap={renderMap} />
      </ScrollView>
      {arena === undefined ? null : (
        <MapSwitchSheet
          isOpen={home.isSwitchOpen}
          maps={home.formatMaps}
          formatLabel={t("arena.maps.format", {
            size: `${arena.format.size}×${arena.format.size}`,
            league: leagueLabelOf(arena.profile.league, arena.profile.division),
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
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ArenaHomeScreen;
