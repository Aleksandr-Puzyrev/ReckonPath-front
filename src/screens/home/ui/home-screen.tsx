import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { StreakRestoreCard } from "@features/restore-streak";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import { BoardPreview } from "@widgets/board";
import { CurrentGame } from "@widgets/current-game";
import { DailyCard } from "@widgets/daily-card";
import { EarnSheet } from "@widgets/earn-sheet";
import { QuickLinks, TodayStats } from "@widgets/home-summary";
import { TopBar } from "@widgets/top-bar";

import { useHomeScreen } from "../model/use-home-screen";

import { styles } from "./home-screen-styles";
import HomeSkeleton from "./home-skeleton";
import HomeTour from "./home-tour";

const HomeScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const home = useHomeScreen();

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <TopBar onWalletPress={home.handleEarnOpen} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {home.isOnline ? null : (
          <Text variant="body.s" style={styles.offline} testID="home-offline">
            {t("common.offline")}
          </Text>
        )}
        <CurrentGame
          renderPreview={({ level }, game) => (
            <BoardPreview level={level} game={game} size={theme.sizes.home.heroBoard} />
          )}
          onPlay={home.handlePlay}
          onDaily={home.handleDaily}
        />
        {home.restoreOffer === null ? (
          <DailyCard onOpen={home.handleDaily} />
        ) : (
          <StreakRestoreCard
            offer={home.restoreOffer}
            onRestored={home.handleRestored}
            onShortOfEmeralds={home.handleShortOfEmeralds}
            onError={home.handleRestoreError}
          />
        )}
        {home.isLoading ? (
          <HomeSkeleton />
        ) : (
          <>
            <QuickLinks
              arena={home.arenaLink}
              dropLeft={home.dropLeft}
              onArena={home.handleArena}
              onShop={home.handleShop}
            />
            <TodayStats stats={home.stats} note={home.cacheNote} />
          </>
        )}
      </ScrollView>
      <EarnSheet
        isOpen={home.isEarnOpen}
        shortBy={home.earnShortBy}
        onDaily={() => {
          home.handleEarnClose();
          home.handleDaily();
        }}
        onMessage={(messageKey) => home.showToast(t(messageKey))}
        onClose={home.handleEarnClose}
      />
      {home.isTourShown ? <HomeTour onDone={home.handleTourDone} /> : null}
      <Toast message={home.toast} onHide={home.handleToastHide} />
    </Screen>
  );
};

export default HomeScreen;
