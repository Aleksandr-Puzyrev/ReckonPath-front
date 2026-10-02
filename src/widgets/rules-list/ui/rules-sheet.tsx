import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { RuleCardId } from "@entities/rules";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import ChevronRightIcon from "@assets/icons/levels/chevron-right.svg";

import { styles } from "./rules-sheet-styles";

interface IRulesSheet {
  isOpen: boolean;
  cards: readonly RuleCardId[];
  fogCount?: number;
  onOpenCard: (index: number) => void;
  onClose: () => void;
}

const DEFAULT_FOG = 2;

const RulesSheet = ({
  isOpen,
  cards,
  fogCount = DEFAULT_FOG,
  onOpenCard,
  onClose,
}: IRulesSheet) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.m;

  return (
    <Sheet isOpen={isOpen} onDismiss={onClose}>
      <Text variant="display.m">{t("play.pause.rules")}</Text>
      <Text variant="body.s" style={styles.hint}>
        {t("rules.listHint")}
      </Text>
      {cards.map((id, index) => (
        <Pressable
          key={id}
          testID={`rule-${id}`}
          accessibilityRole="button"
          accessibilityLabel={t(`rules.title.${id}`)}
          onPress={() => onOpenCard(index)}
          style={styles.row}
        >
          <View style={styles.texts}>
            <Text variant="title.s">{t(`rules.title.${id}`)}</Text>
            <Text variant="caption" style={styles.hint} numberOfLines={1}>
              {t(`rules.${id}`, { count: fogCount })}
            </Text>
          </View>
          <ChevronRightIcon
            width={iconSize}
            height={iconSize}
            color={theme.colors.text.secondary}
          />
        </Pressable>
      ))}
    </Sheet>
  );
};

export default RulesSheet;
