import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { PlayerRef } from "@entities/player";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import type { useReportPlayer } from "../model/use-report-player";

import ReportReasons from "./report-reasons";
import { styles } from "./report-sheet-styles";

interface IReportSheet {
  player: PlayerRef | null;
  report: ReturnType<typeof useReportPlayer>;
  onClose: () => void;
}

const ReportSheet = ({ player, report, onClose }: IReportSheet) => {
  const { t } = useTranslation();

  return (
    <Sheet isOpen={player !== null} onDismiss={onClose}>
      <View style={styles.sheet}>
        <Text variant="title.m" accessibilityRole="header" numberOfLines={1}>
          {t("report.title", { name: player?.name ?? "" })}
        </Text>
        <ReportReasons
          sent={report.sent}
          isDisabled={report.isPending}
          onReport={(reason) => {
            if (player !== null) report.report(player, reason);
            onClose();
          }}
        />
      </View>
    </Sheet>
  );
};

export default ReportSheet;
