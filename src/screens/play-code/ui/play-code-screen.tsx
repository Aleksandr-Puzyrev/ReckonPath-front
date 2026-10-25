import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { usePlayCode } from "../model/use-play-code";

import CodePreview from "./code-preview";
import { styles } from "./play-code-styles";

const PlayCodeScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const screen = usePlayCode();
  const { decoded } = screen;
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="play-code-back"
          accessibilityLabel={t("common.back")}
          onPress={screen.handleClose}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" style={styles.title} accessibilityRole="header">
          {t("code.play.title")}
        </Text>
      </View>
      <View style={styles.field}>
        <View style={styles.input}>
          <TextField
            testID="play-code-input"
            label={t("code.play.field")}
            value={screen.code}
            onChangeText={screen.handleChange}
            error={
              decoded === null || decoded.ok ? undefined : t(`code.play.error.${decoded.error}`)
            }
          />
        </View>
        <Button
          testID="play-code-paste"
          label={t("code.play.paste")}
          variant="secondary"
          onPress={() => void screen.handlePaste()}
        />
      </View>
      {decoded?.ok === true ? (
        <>
          <CodePreview level={decoded.level} challenge={decoded.challenge} />
          <Button
            testID="play-code-play"
            label={t("code.play.play").toLocaleUpperCase()}
            variant="primary"
            size="l"
            onPress={screen.handlePlay}
          />
        </>
      ) : null}
    </Screen>
  );
};

export default PlayCodeScreen;
