import type { Friend, FriendStatus } from "./friend-types";

// The backend leaves the status out where it does not know it, which reads as offline (бэкенд не присылает статус, когда его не знает, — это «не в сети»).
export const friendStatusOf = ({ status }: Pick<Friend, "status">): FriendStatus =>
  status ?? "offline";

export const FRIEND_STATUS_TEXT_KEY = {
  online: "friends.status.online",
  in_match: "friends.status.inMatch",
  offline: "friends.offline",
} as const satisfies Record<FriendStatus, string>;
