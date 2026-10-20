import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./arena-async-styles";

interface IAuthorCard {
  nickname: string;
  league: string;
  norm: number;
}

const AuthorCard = ({ nickname, league, norm }: IAuthorCard) => {
  const { t } = useTranslation();

  return (
    <View style={styles.author} testID="async-author">
      <View style={styles.avatar}>
        <Text variant="title.m" style={styles.avatarLetter}>
          {nickname.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.flex}>
        <Text variant="eyebrow" style={styles.secondary}>
          {t("async.author")}
        </Text>
        <Text variant="title.s">{`${nickname} · ${league}`}</Text>
      </View>
      <Text variant="title.s" style={styles.norm}>
        {t("async.norm", { count: norm })}
      </Text>
    </View>
  );
};

export default AuthorCard;
