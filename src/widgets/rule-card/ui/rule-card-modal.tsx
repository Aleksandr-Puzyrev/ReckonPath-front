import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { RuleCardId } from "@entities/rules";
import { Button } from "@shared/ui/button";
import { IconButton } from "@shared/ui/icon-button";
import { Text } from "@shared/ui/text";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";
import ChevronRightIcon from "@assets/icons/levels/chevron-right.svg";

import { styles } from "./rule-card-modal-styles";

interface IRuleCardModal {
  cards: readonly RuleCardId[];
  initialIndex?: number;
  isBrowsable?: boolean;
  fogCount?: number;
  renderDemo: (id: RuleCardId) => ReactNode;
  onClose: () => void;
}

const DEFAULT_FOG = 2;

const RuleCardModal = ({
  cards,
  initialIndex = 0,
  isBrowsable = false,
  fogCount = DEFAULT_FOG,
  renderDemo,
  onClose,
}: IRuleCardModal) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.iconButton.icon;
  const [index, setIndex] = useState(initialIndex);
  const id = cards[index];
  if (id === undefined) return null;

  const wrap = (next: number) => (next + cards.length) % cards.length;
  const handleGotIt = () => {
    if (isBrowsable || index === cards.length - 1) onClose();
    else setIndex(index + 1);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text variant="eyebrow" style={styles.eyebrow}>
              {t("rules.newElement")}
            </Text>
            {isBrowsable ? (
              <Text
                variant="caption"
                style={styles.counter}
              >{`${index + 1} / ${cards.length}`}</Text>
            ) : null}
          </View>
          <Text variant="display.m" accessibilityRole="header">
            {t(`rules.title.${id}`)}
          </Text>
          <View style={styles.demo}>{renderDemo(id)}</View>
          <Text variant="body.l" style={styles.rule}>
            {t(`rules.${id}`, { count: fogCount })}
          </Text>
          {isBrowsable && cards.length > 1 ? (
            <View style={styles.pager}>
              <IconButton
                accessibilityLabel={t("rules.previous")}
                onPress={() => setIndex(wrap(index - 1))}
                icon={
                  <ChevronLeftIcon
                    width={iconSize}
                    height={iconSize}
                    color={theme.colors.text.primary}
                  />
                }
              />
              <View style={styles.dots}>
                {cards.map((card, dot) => (
                  <Pressable
                    key={card}
                    accessibilityRole="button"
                    accessibilityLabel={t(`rules.title.${card}`)}
                    onPress={() => setIndex(dot)}
                    hitSlop={(theme.sizes.touchTarget - theme.space[3]) / 2}
                    style={[styles.dot, dot === index && styles.dotActive]}
                  />
                ))}
              </View>
              <IconButton
                accessibilityLabel={t("rules.next")}
                onPress={() => setIndex(wrap(index + 1))}
                icon={
                  <ChevronRightIcon
                    width={iconSize}
                    height={iconSize}
                    color={theme.colors.text.primary}
                  />
                }
              />
            </View>
          ) : null}
          <Button
            testID="rule-card-ok"
            label={t("rules.gotIt").toLocaleUpperCase()}
            variant="primary"
            size="l"
            onPress={handleGotIt}
          />
        </View>
      </View>
    </Modal>
  );
};

export default RuleCardModal;
