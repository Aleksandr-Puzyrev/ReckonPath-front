import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import type { ArenaFormat } from "@entities/arena";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { ARENA_INTRO_CARDS } from "../model/arena-intro-cards";
import type { ArenaIntroCard as Card } from "../model/arena-intro-cards";

import IntroDemo from "./intro-demo";
import { styles } from "./arena-onboarding-styles";

interface IArenaIntroCard {
  card: Card;
  index: number;
  format: ArenaFormat;
  isStarting: boolean;
  onNext: () => void;
  onSkip: () => void;
}

const ArenaIntroCard = ({ card, index, format, isStarting, onNext, onSkip }: IArenaIntroCard) => {
  const { t } = useTranslation();
  const isLast = index === ARENA_INTRO_CARDS.length - 1;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="eyebrow" style={styles.eyebrow}>
          {t("arenaIntro.title")}
        </Text>
        <Text variant="caption" style={styles.secondary}>
          {t("arenaIntro.count", { n: index + 1, total: ARENA_INTRO_CARDS.length })}
        </Text>
      </View>
      <Text variant="display.m" accessibilityRole="header">
        {t(`arenaIntro.cards.${card}.title`)}
      </Text>
      <View style={styles.demo}>
        <IntroDemo card={card} />
      </View>
      <Text variant="body.l" style={styles.secondary}>
        {t(`arenaIntro.cards.${card}.text`, {
          sec: format.turnSec,
          size: `${format.size}×${format.size}`,
        })}
      </Text>
      <View style={styles.dots}>
        {ARENA_INTRO_CARDS.map((dot, dotIndex) => (
          <View key={dot} style={[styles.dot, dotIndex === index && styles.dotActive]} />
        ))}
      </View>
      <Button
        testID="intro-next"
        label={t(isLast ? "arenaIntro.toTraining" : "arenaIntro.next").toLocaleUpperCase()}
        variant="primary"
        size="l"
        isDisabled={isStarting}
        onPress={onNext}
      />
      <Pressable
        testID="intro-skip"
        accessibilityRole="button"
        disabled={isStarting}
        style={styles.skip}
        onPress={onSkip}
      >
        <Text variant="button.m" style={styles.secondary}>
          {t("arenaIntro.skip")}
        </Text>
      </Pressable>
    </View>
  );
};

export default ArenaIntroCard;
