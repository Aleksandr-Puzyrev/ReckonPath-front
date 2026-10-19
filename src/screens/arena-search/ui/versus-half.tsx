import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";
import { leagueLabelOf } from "@widgets/arena-hero";

import { styles } from "./arena-search-styles";

interface IVersusHalf {
  side: "me" | "opponent";
  nickname: string;
  league: string;
  division: number;
  trophies: number;
  isBot: boolean;
}

const VersusHalf = ({ side, nickname, league, division, trophies, isBot }: IVersusHalf) => {
  const { t, i18n } = useTranslation();
  styles.useVariants({ side });

  return (
    <View style={styles.half} testID={`versus-${side}`}>
      <View style={styles.avatar}>
        <Text variant="display.l" style={styles.avatarLetter}>
          {nickname.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <Text variant="title.l" numberOfLines={1}>
        {nickname}
      </Text>
      {isBot ? (
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
          {`${leagueLabelOf(league, division)} · ${formatNumber(trophies, i18n.language)}`}
        </Text>
      )}
    </View>
  );
};

export default VersusHalf;
