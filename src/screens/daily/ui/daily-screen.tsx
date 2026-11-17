import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useDailyUnlock } from "@features/daily-today";
import { IconButton } from "@shared/ui/icon-button";
import { Dialog } from "@shared/ui/dialog";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import { EarnSheet } from "@widgets/earn-sheet";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { useDailyScreen } from "../model/use-daily-screen";

import DailyBody from "./daily-body";
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
        <DailyBody daily={daily} />
      </ScrollView>
      <EarnSheet
        isOpen={daily.earnShortBy !== null}
        shortBy={daily.earnShortBy}
        onDaily={daily.handleEarnClose}
        onMessage={daily.restoreCallbacks.onError}
        onClose={daily.handleEarnClose}
      />
      <Dialog
        isOpen={daily.isRestoreFirstOpen}
        title={t("daily.restoreFirst")}
        onCancel={daily.handleRestoreFirstClose}
        actions={[
          { label: t("home.play"), variant: "secondary", onPress: daily.handlePlayAnyway },
          { label: t("streak.restore"), variant: "primary", onPress: daily.handleRestoreFirst },
        ]}
      />
      <Toast message={daily.toast} onHide={daily.handleToastHide} />
    </Screen>
  );
};

// A locked daily can still be reached by a link (закрытый дейли всё равно можно открыть по ссылке).
const DailyScreen = () => {
  const { isUnlocked, unlockLevel, isLoading } = useDailyUnlock();
  if (isLoading) return null;
  if (!isUnlocked) {
    return <DailyLocked unlockLevel={unlockLevel} onBack={() => router.replace("/")} />;
  }
  return <DailyContent />;
};

export default DailyScreen;
