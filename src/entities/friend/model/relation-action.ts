import type { FriendRelation } from "./friend-types";

export type RelationAction = "add" | "sent" | "accept" | "friend" | "none";

const ACTION_OF_RELATION: Record<FriendRelation, RelationAction> = {
  none: "add",
  outgoing: "sent",
  incoming: "accept",
  friend: "friend",
  blocked: "none",
};

export const relationActionOf = (relation: FriendRelation): RelationAction =>
  ACTION_OF_RELATION[relation];
