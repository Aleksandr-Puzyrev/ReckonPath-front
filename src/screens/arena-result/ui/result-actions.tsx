import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { IconButton } from "@shared/ui/icon-button";

import MoreIcon from "@assets/icons/friends/more.svg";

import type { useResultRival } from "../model/use-result-rival";

import { styles } from "./arena-result-styles";

interface IResultActions {
  arenaLabel: string;
  rival: ReturnType<typeof useResultRival>;
  onArena: () => void;
}

const ResultActions = ({ arenaLabel, rival, onArena }: IResultActions) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <View style={styles.actions}>
      <View style={styles.action}>
        <Button testID="result-arena" label={arenaLabel} variant="ghost" onPress={onArena} />
      </View>
      {rival.canAddFriend ? (
        <View style={styles.action}>
          <Button
            testID="result-add-friend"
            label={rival.isRequestSent ? t("player.sentShort") : t("player.addShort")}
            variant="secondary"
            isDisabled={rival.isDisabled || rival.isRequestSent}
            onPress={rival.handleAddFriend}
          />
        </View>
      ) : null}
      {rival.rival === null ? null : (
        <IconButton
          testID="result-more"
          accessibilityLabel={t("player.more")}
          isDisabled={rival.isDisabled}
          onPress={rival.handleMenuOpen}
          icon={<MoreIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />}
        />
      )}
    </View>
  );
};

export default ResultActions;
