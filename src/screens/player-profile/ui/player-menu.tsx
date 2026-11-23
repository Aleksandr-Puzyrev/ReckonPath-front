import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { PlayerProfile } from "@entities/player";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import { styles } from "./player-profile-styles";

interface IPlayerMenu {
  profile: PlayerProfile | undefined;
  isOpen: boolean;
  onReport: () => void;
  onBlock: () => void;
  onRemove: () => void;
  onClose: () => void;
}

const PlayerMenu = ({ profile, isOpen, onReport, onBlock, onRemove, onClose }: IPlayerMenu) => {
  const { t } = useTranslation();

  return (
    <Sheet isOpen={isOpen && profile !== undefined} onDismiss={onClose}>
      <View style={styles.sheet}>
        <Text variant="title.m" accessibilityRole="header" numberOfLines={1}>
          {profile?.name ?? ""}
        </Text>
        <Button
          testID="player-report"
          label={t("report.action")}
          variant="secondary"
          size="l"
          onPress={onReport}
        />
        {profile?.relation === "blocked" ? null : (
          <Button
            testID="player-block"
            label={t("block.action")}
            variant="secondary"
            size="l"
            onPress={onBlock}
          />
        )}
        {profile?.relation === "friend" ? (
          <Button
            testID="player-remove"
            label={t("friends.remove")}
            variant="danger"
            size="l"
            onPress={onRemove}
          />
        ) : null}
      </View>
    </Sheet>
  );
};

export default PlayerMenu;
