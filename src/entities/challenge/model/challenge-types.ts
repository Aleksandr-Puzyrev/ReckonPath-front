import type { components } from "@shared/api";
import type { ArenaEvent } from "@shared/ws";

export type Challenge = components["schemas"]["ChallengeView"];
export type ChallengeStatus = components["schemas"]["ChallengeStatus"];
export type ChallengeNotice = NonNullable<ArenaEvent["challenge"]>;
