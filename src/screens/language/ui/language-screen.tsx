import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import type { AppLanguage } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import { useLanguageScreen } from "../model/use-language-screen";

import { styles } from "./language-screen-styles";

const OPTIONS = [
  { value: "ru", code: "RU", name: "onboarding.language.ru", hint: "onboarding.language.ruHint" },
  { value: "en", code: "EN", name: "onboarding.language.en", hint: "onboarding.language.enHint" },
] as const satisfies readonly { value: AppLanguage; code: string; name: string; hint: string }[];

// The language step comes before the level 1 tutorial (выбор языка идёт перед обучением на уровне 1).
const LanguageScreen = () => {
  const { t } = useTranslation();
  const { current, handlePick, handleContinue } = useLanguageScreen();

  return (
    <Screen style={styles.screen}>
      <View style={styles.head}>
        <Text variant="display.m" accessibilityRole="header" style={styles.center}>
          {t("onboarding.language.title")}
        </Text>
        <Text variant="title.m" style={[styles.secondary, styles.center]}>
          {t("onboarding.language.subtitle")}
        </Text>
      </View>
      <View style={styles.options} accessibilityRole="radiogroup">
        {OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            testID={`language-${option.value}`}
            accessibilityRole="radio"
            accessibilityLabel={t(option.name)}
            accessibilityState={{ selected: option.value === current }}
            onPress={() => handlePick(option.value)}
            style={[styles.option, option.value === current ? styles.selected : null]}
          >
            <Text variant="title.m" style={styles.code}>
              {option.code}
            </Text>
            <View style={styles.texts}>
              <Text variant="title.s">{t(option.name)}</Text>
              <Text variant="body.s" style={styles.secondary}>
                {t(option.hint)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      <Text variant="body.s" style={[styles.secondary, styles.center]}>
        {t("onboarding.language.note")}
      </Text>
      <Button
        testID="language-continue"
        label={t("onboarding.language.continue").toLocaleUpperCase()}
        variant="primary"
        size="l"
        onPress={handleContinue}
      />
    </Screen>
  );
};

export default LanguageScreen;
