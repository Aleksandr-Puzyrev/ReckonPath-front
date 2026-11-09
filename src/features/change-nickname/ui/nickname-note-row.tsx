import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { formatDayMonth, formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import EmeraldIcon from "@assets/icons/play/emerald.svg";

import type { NicknameNote } from "../model/nickname-note";

import { styles } from "./nickname-form-styles";

interface INicknameNoteRow {
  note: NicknameNote;
}

const NicknameNoteRow = ({ note }: INicknameNoteRow) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.s;

  if (note.kind === "free") {
    return (
      <View style={styles.note}>
        <Text variant="body.s" style={styles.noteText}>
          {t("nick.free")}
        </Text>
      </View>
    );
  }
  if (note.kind === "cooldown") {
    return (
      <View style={styles.note}>
        <Text variant="body.s" style={styles.noteText}>
          {t("nick.nextAt", { date: formatDayMonth(note.availableAt, i18n.language) })}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.note}>
      <EmeraldIcon width={iconSize} height={iconSize} />
      <Text variant="body.s" style={styles.noteText}>
        {t("nick.paid", { price: formatNumber(note.price, i18n.language) })}
      </Text>
    </View>
  );
};

export default NicknameNoteRow;
