import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { useMyLevels } from "../model/use-my-levels";

import LevelRow from "./level-row";
import MyLevelsStatus from "./my-levels-status";
import { styles } from "./my-levels-styles";
import NewLevelSheet from "./new-level-sheet";

const MyLevelsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const screen = useMyLevels();
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="my-levels-back"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" accessibilityRole="header">
          {t("editor.list.title")}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="body.s" style={styles.secondary}>
          {t("editor.list.hint")}
        </Text>
        <MyLevelsStatus
          isPending={screen.isPending}
          isError={screen.isError}
          isOnline={screen.isOnline}
          isEmpty={screen.items.length === 0}
          onRetry={screen.handleRetry}
        />
        {screen.items.map((entry) => (
          <LevelRow
            key={entry.id}
            entry={entry}
            isDeleteDisabled={!screen.isOnline || screen.isDeleting}
            onOpen={screen.handleOpen}
            onDelete={screen.handleDeleteAsk}
          />
        ))}
        <Button
          testID="my-levels-new"
          label={t("editor.list.new").toLocaleUpperCase()}
          variant="primary"
          size="l"
          onPress={screen.handleNewOpen}
        />
      </ScrollView>
      <NewLevelSheet
        isOpen={screen.isNewOpen}
        onCreate={screen.handleCreate}
        onClose={screen.handleNewClose}
      />
      <Dialog
        isOpen={screen.deletingId !== null}
        title={t("editor.list.delete")}
        message={t("editor.list.deleteBody")}
        onCancel={screen.handleDeleteCancel}
        actions={[
          { label: t("common.cancel"), variant: "secondary", onPress: screen.handleDeleteCancel },
          {
            label: t("editor.list.delete"),
            variant: "danger",
            onPress: screen.handleDeleteConfirm,
          },
        ]}
      />
      <Toast message={screen.toast} onHide={screen.handleToastHide} />
    </Screen>
  );
};

export default MyLevelsScreen;
