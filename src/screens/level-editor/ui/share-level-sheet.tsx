import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share, View } from "react-native";

import { encodeLevel } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { customLevelTitleOf, useTryoutBestStore } from "@entities/custom-level";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { SwitchRow } from "@shared/ui/switch-row";
import { Text } from "@shared/ui/text";

import { styles } from "./level-editor-styles";

interface IShareLevelSheet {
  isOpen: boolean;
  level: LevelInput;
  onToast: (text: string) => void;
  onClose: () => void;
}

// The link carries the code, so the level opens without the server (ссылка несёт код, поэтому уровень открывается без сервера).
const linkOf = (code: string) => Linking.createURL("play", { queryParams: { c: code } });

const ShareLevelSheet = ({ isOpen, level, onToast, onClose }: IShareLevelSheet) => {
  const { t, i18n } = useTranslation();
  const best = useTryoutBestStore((state) => state.best[encodeLevel(level)]);
  const [isChallenge, setIsChallenge] = useState(false);
  const code = encodeLevel(level, isChallenge && best !== undefined ? best : null);
  const title = customLevelTitleOf(level, i18n.language);
  const details = [
    title,
    t("editor.list.size", { rows: level.rows, cols: level.cols }),
    t("levels.targets", { count: level.targets.length }),
  ].join(" · ");

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    onToast(t("code.share.copied"));
  };

  return (
    <Sheet isOpen={isOpen} onDismiss={onClose}>
      <View style={styles.sheet}>
        <Text variant="title.m" accessibilityRole="header">
          {t("code.share.title")}
        </Text>
        <Text variant="body.s" style={styles.secondary}>
          {details}
        </Text>
        <Text variant="eyebrow" style={styles.secondary}>
          {t("code.share.code")}
        </Text>
        <Text variant="body.s" style={styles.code} testID="share-code" selectable>
          {code}
        </Text>
        <Button testID="share-copy" label={t("code.share.copy")} onPress={() => void copy()} />
        {best === undefined ? null : (
          <SwitchRow
            testID="share-challenge"
            label={`${t("code.share.challenge")} · ${t("code.share.challengeHint", { count: best })}`}
            isOn={isChallenge}
            onToggle={() => setIsChallenge((current) => !current)}
          />
        )}
        <Button
          testID="share-link"
          label={t("code.share.link").toLocaleUpperCase()}
          variant="primary"
          size="l"
          onPress={() => void Share.share({ message: `${title}\n${code}\n${linkOf(code)}` })}
        />
      </View>
    </Sheet>
  );
};

export default ShareLevelSheet;
