import { router } from "expo-router";
import type { Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { IconButton } from "@shared/ui/icon-button";
import { Text } from "@shared/ui/text";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { styles } from "./event-styles";

const EventHeader = ({
  title,
  isList = false,
  fallback,
}: {
  title: string;
  isList?: boolean;
  fallback?: Href;
}) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const size = theme.sizes.iconButton.icon;
  return (
    <View style={styles.header}>
      <IconButton
        accessibilityLabel={t("common.back")}
        icon={<ChevronLeftIcon width={size} height={size} color={theme.colors.text.primary} />}
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace(fallback ?? (isList ? "/" : "/events"));
        }}
      />
      <Text variant="title.m" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
  );
};

export default EventHeader;
