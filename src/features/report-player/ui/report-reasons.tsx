import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";

import { REPORT_REASONS } from "../model/report-reasons";
import type { OfferedReportReason } from "../model/report-reasons";

interface IReportReasons {
  sent: readonly OfferedReportReason[];
  isDisabled: boolean;
  onReport: (reason: OfferedReportReason) => void;
}

const ReportReasons = ({ sent, isDisabled, onReport }: IReportReasons) => {
  const { t } = useTranslation();

  return REPORT_REASONS.map((reason) => {
    const isSent = sent.includes(reason);
    return (
      <Button
        key={reason}
        testID={`report-${reason}`}
        label={t(`report.reason.${reason}`)}
        caption={isSent ? t("report.done") : undefined}
        variant="secondary"
        size="l"
        isDisabled={isDisabled || isSent}
        onPress={() => onReport(reason)}
      />
    );
  });
};

export default ReportReasons;
