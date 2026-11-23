import type { PlayerRelation } from "@entities/player";

export type MainAction = "add" | "sent" | "accept" | "challenge" | "unblock";

const ACTION_OF_RELATION: Record<PlayerRelation, MainAction | null> = {
  self: null,
  none: "add",
  outgoing: "sent",
  incoming: "accept",
  friend: "challenge",
  blocked: "unblock",
};

export const mainActionOf = (relation: PlayerRelation) => ACTION_OF_RELATION[relation];
