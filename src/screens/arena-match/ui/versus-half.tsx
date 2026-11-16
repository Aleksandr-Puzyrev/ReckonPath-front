import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { PlayerView } from "@entities/match";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";
import { stepLabelOf } from "@widgets/arena-hero";

import { styles } from "./versus-styles";

interface IVersusHalf {
  side: "me" | "opponent";
  player: PlayerView;
}

const VersusHalf = ({ side, player }: IVersusHalf) => {
  const { t, i18n } = useTranslation();
  styles.useVariants({ side });

  return (
    <View style={styles.half} testID={`versus-${side}`}>
      <View style={styles.avatar}>
        <Text variant="display.l" style={styles.avatarLetter}>
          {player.name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <Text variant="title.l" numberOfLines={1}>
        {player.name}
      </Text>
      {player.bot === true ? (
        <>
          <Text variant="eyebrow" style={styles.botLabel}>
            {t("vs.bot")}
          </Text>
          <Text variant="caption" style={styles.secondary}>
            {t("match.botTrophies")}
          </Text>
        </>
      ) : (
        <Text variant="body.s" style={styles.secondary}>
          {`${stepLabelOf(player.league)} · ${formatNumber(player.trophies, i18n.language)}`}
        </Text>
      )}
    </View>
  );
};

export default VersusHalf;
