import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useGameSessionStore } from "@entities/level";
import { HudCounter } from "@shared/ui/hud-counter";

import MineIcon from "@assets/icons/play/mine.svg";

import { hudValuesOf, movesToneOf } from "../model/hud-values";

import { styles } from "./hud-styles";
import ModeChip from "./mode-chip";
import StarBar from "./star-bar";

const Hud = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const game = useGameSessionStore((state) => state.game);
  if (game === null) return null;

  const values = hudValuesOf(game);
  const moves =
    values.limit === null ? String(values.movesUsed) : `${values.movesLeft} / ${values.limit}`;
  const iconSize = theme.sizes.icon.s;

  return (
    <View style={styles.hud}>
      <View style={styles.counters}>
        <HudCounter
          label={t("play.hud.moves")}
          value={moves}
          tone={movesToneOf(values.movesLeft)}
        />
        <HudCounter label={t("play.hud.targets")} value={`${values.found} / ${values.targets}`} />
        {values.hasBombs ? (
          <HudCounter
            label={t("play.hud.bombs")}
            value={t("play.hud.count", { count: values.bombsLeft })}
            icon={
              <MineIcon width={iconSize} height={iconSize} color={theme.colors.status.danger} />
            }
          />
        ) : null}
        {values.hasBuoys ? (
          <HudCounter
            label={t("play.hud.buoys")}
            value={t("play.hud.count", { count: values.buoysLeft })}
          />
        ) : null}
      </View>
      <View style={styles.progressRow}>
        {values.starMarks === null || values.movesShare === null ? (
          <View style={styles.spacer} />
        ) : (
          <StarBar share={values.movesShare} marks={values.starMarks} />
        )}
        <ModeChip mode={game.rules.probeMode} fog={game.rules.fog} />
      </View>
    </View>
  );
};

export default Hud;
