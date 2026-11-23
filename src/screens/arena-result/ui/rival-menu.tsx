import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { PlayerLink } from "@entities/player";
import { ReportReasons } from "@features/report-player";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import type { useResultRival } from "../model/use-result-rival";

import { styles } from "./arena-result-styles";

interface IRivalMenu {
  rival: ReturnType<typeof useResultRival>;
}

// The rival's name in the sheet is the way to his profile from the result (имя соперника в листе — путь к его профилю с экрана результата).
const RivalMenu = ({ rival }: IRivalMenu) => {
  const { t } = useTranslation();
  const player = rival.rival;

  return (
    <Sheet isOpen={rival.isMenuOpen && player !== null} onDismiss={rival.handleMenuClose}>
      <View style={styles.menu}>
        {player === null ? null : (
          <PlayerLink testID="result-rival" name={player.name} onPress={rival.handleOpenProfile}>
            <Text variant="title.m" accessibilityRole="header" numberOfLines={1}>
              {player.name}
            </Text>
          </PlayerLink>
        )}
        <ReportReasons
          sent={rival.report.sent}
          isDisabled={rival.isDisabled}
          onReport={(reason) => {
            if (player !== null) rival.report.report(player, reason);
          }}
        />
        <Button
          testID="result-block"
          label={t("block.action")}
          caption={rival.isBlocked ? t("block.done") : undefined}
          variant="secondary"
          size="l"
          isDisabled={rival.isDisabled || rival.isBlocked}
          onPress={rival.handleBlock}
        />
        <Button
          testID="result-menu-close"
          label={t("common.close")}
          variant="ghost"
          size="l"
          onPress={rival.handleMenuClose}
        />
      </View>
    </Sheet>
  );
};

export default RivalMenu;
