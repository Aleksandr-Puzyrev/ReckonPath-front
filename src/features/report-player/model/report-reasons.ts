import type { ReportReason } from "@entities/player";

export const REPORT_REASONS = ["nickname", "cheating"] as const satisfies readonly ReportReason[];

export type OfferedReportReason = (typeof REPORT_REASONS)[number];
