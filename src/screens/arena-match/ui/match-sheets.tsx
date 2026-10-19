import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { SwitchRow } from "@shared/ui/switch-row";

import type { MatchSheet } from "../model/use-arena-match";

import { styles } from "./arena-match-styles";

export const EMOTES = ["nice", "wow", "oops", "luck", "echo", "thanks"] as const;

type Emote = (typeof EMOTES)[number];

interface IMatchSheets {
  sheet: MatchSheet;
  isMuted: boolean;
  onEmote: (emote: Emote) => void;
  onMuteToggle: () => void;
  onSurrender: () => void;
  onClose: () => void;
}

const MatchSheets = ({
  sheet,
  isMuted,
  onEmote,
  onMuteToggle,
  onSurrender,
  onClose,
}: IMatchSheets) => {
  const { t } = useTranslation();

  return (
    <>
      <Sheet isOpen={sheet === "emotes"} onDismiss={onClose}>
        <View style={styles.emotes}>
          {EMOTES.map((emote) => (
            <View key={emote} style={styles.emoteCell}>
              <Button
                testID={`emote-${emote}`}
                label={t(`match.emote.${emote}`)}
                variant="secondary"
                onPress={() => onEmote(emote)}
              />
            </View>
          ))}
        </View>
      </Sheet>
      <Sheet isOpen={sheet === "menu"} onDismiss={onClose}>
        <View style={styles.menu}>
          <SwitchRow
            testID="match-mute"
            label={t("match.mute")}
            isOn={isMuted}
            onToggle={onMuteToggle}
          />
          <Button
            testID="match-surrender"
            label={t("match.surrender.action")}
            variant="danger"
            onPress={onSurrender}
          />
        </View>
      </Sheet>
    </>
  );
};

export default MatchSheets;
