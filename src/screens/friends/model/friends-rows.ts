import type { Friend, FriendRequest, FriendsList } from "@entities/friend";

export type FriendsTab = "friends" | "requests";

export type FriendsRow =
  | { kind: "friend"; key: string; friend: Friend }
  | { kind: "incoming"; key: string; request: FriendRequest }
  | { kind: "outgoingTitle"; key: string }
  | { kind: "outgoing"; key: string; request: FriendRequest };

export const friendsRowsOf = (list: FriendsList, tab: FriendsTab): FriendsRow[] => {
  if (tab === "friends") {
    return list.friends.map((friend) => ({ kind: "friend", key: `friend-${friend.id}`, friend }));
  }
  const incoming = list.incoming.map((request): FriendsRow => ({
    kind: "incoming",
    key: `incoming-${request.id}`,
    request,
  }));
  if (list.outgoing.length === 0) return incoming;
  return [
    ...incoming,
    { kind: "outgoingTitle", key: "outgoing-title" },
    ...list.outgoing.map((request): FriendsRow => ({
      kind: "outgoing",
      key: `outgoing-${request.id}`,
      request,
    })),
  ];
};
