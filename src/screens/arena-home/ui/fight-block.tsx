import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { MatchFormat } from "@entities/match";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-home-styles";

interface IFightBlock {
  format: MatchFormat;
  isOnline: boolean;
  canFight: boolean;
  onFight: () => void;
  onMapMatch: () => void;
}

const FightBlock = ({ format, isOnline, canFight, onFight, onMapMatch }: IFightBlock) => {
  const { t } = useTranslation();

  return (
    <View style={styles.fight}>
      <View style={styles.fightButtons}>
        <View style={styles.fightMain}>
          <Button
            testID="arena-fight"
            label={t("arena.fight")}
            size="l"
            isDisabled={!canFight}
            caption={isOnline ? undefined : t("arena.needInternet")}
            onPress={onFight}
          />
        </View>
        <Button
          testID="arena-async"
          label={t("arena.async")}
          size="l"
          variant="secondary"
          isDisabled={!canFight}
          onPress={onMapMatch}
        />
      </View>
      <Text variant="body.s" style={styles.secondary}>
        {t("arena.format", {
          size: `${format.rows}×${format.cols}`,
          count: format.targets,
          sec: format.moveSeconds,
        })}
      </Text>
    </View>
  );
};

export default FightBlock;
