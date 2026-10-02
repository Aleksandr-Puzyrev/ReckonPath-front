import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useIsDailyUnlocked } from "@features/daily-today";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { BoardPreview } from "@widgets/board";
import { DailyCalendar } from "@widgets/daily-calendar";
import { DailyTodayCard } from "@widgets/daily-today-card";
import { DayLeaderboard } from "@widgets/day-leaderboard";
import { StreakCard } from "@widgets/streak-card";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { useDailyScreen } from "../model/use-daily-screen";

import DailyLocked from "./daily-locked";
import { styles } from "./daily-screen-styles";
import DailyTitle from "./daily-title";

const DailyContent = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const daily = useDailyScreen();
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <Screen style={styles.screen}>
      <View style={styles.topBar}>
        <IconButton
          testID="daily-back"
          accessibilityLabel={t("common.back")}
          onPress={daily.handleBack}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <DailyTitle todayKey={daily.todayKey} />
        {daily.streak.lost === null ? null : (
          <View style={styles.lost}>
            <Text variant="title.s">{t("streak.lost", { count: daily.streak.lost })}</Text>
          </View>
        )}
        <DailyTodayCard
          level={daily.level}
          preview={<BoardPreview level={daily.level} size={theme.sizes.daily.preview} />}
          record={daily.record}
          hasSavedGame={daily.hasSavedGame}
          onPlay={daily.handlePlay}
        />
        <StreakCard streak={daily.streak} />
        <DailyCalendar todayKey={daily.todayKey} results={daily.results} />
        <DayLeaderboard
          top={daily.top}
          median={daily.median}
          myPlace={daily.myPlace}
          hasPlayed={daily.hasPlayed}
        />
      </ScrollView>
    </Screen>
  );
};

// A locked daily can still be reached by a link (закрытый дейли всё равно можно открыть по ссылке).
const DailyScreen = () => {
  const isUnlocked = useIsDailyUnlocked();
  if (!isUnlocked) return <DailyLocked onBack={() => router.replace("/")} />;
  return <DailyContent />;
};

export default DailyScreen;
