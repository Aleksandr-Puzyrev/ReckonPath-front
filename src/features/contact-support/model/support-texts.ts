import type { SupportTopic } from "@entities/support";

export const SUPPORT_TEXTS = {
  ban_appeal: { field: "system.appeal.field", sent: "system.appeal.sent" },
  support: { field: "settings.supportField", sent: "settings.supportSent" },
} as const satisfies Record<SupportTopic, { field: string; sent: string }>;

export type SupportSentKey = (typeof SUPPORT_TEXTS)[SupportTopic]["sent"];
