import type { components } from "@shared/api";

export type PlayerProfile = components["schemas"]["PlayerProfile"];
export type PlayerRelation = components["schemas"]["PlayerRelation"];
export type ReportReason = components["schemas"]["ReportReason"];

export interface PlayerRef {
  id: string;
  name: string;
}
