import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ArenaFormat } from "@entities/arena";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-home-styles";

interface IFightBlock {
  format: ArenaFormat;
  isOnline: boolean;
  canFight: boolean;
  onFight: () => void;
  onAsync: () => void;
}

const FightBlock = ({ format, isOnline, canFight, onFight, onAsync }: IFightBlock) => {
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
          onPress={onAsync}
        />
      </View>
      <Text variant="body.s" style={styles.secondary}>
        {t("arena.format", {
          size: `${format.size}×${format.size}`,
          count: format.targets,
          sec: format.turnSec,
        })}
      </Text>
    </View>
  );
};

export default FightBlock;
