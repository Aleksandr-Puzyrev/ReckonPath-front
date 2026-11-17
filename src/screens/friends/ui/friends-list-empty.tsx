import type { FriendsList } from "@entities/friend";

import type { FriendsTab } from "../model/friends-rows";

import FriendsEmpty from "./friends-empty";
import FriendsStatus from "./friends-status";
import NoRequests from "./no-requests";

interface IFriendsListEmpty {
  list: FriendsList | undefined;
  tab: FriendsTab;
  isPending: boolean;
  isOnline: boolean;
  error: Error | null;
  onRetry: () => void;
  onInvite: () => void;
}

const FriendsListEmpty = ({
  list,
  tab,
  isPending,
  isOnline,
  error,
  onRetry,
  onInvite,
}: IFriendsListEmpty) => {
  if (list === undefined) {
    return (
      <FriendsStatus isPending={isPending} isOnline={isOnline} error={error} onRetry={onRetry} />
    );
  }
  if (tab === "requests") return <NoRequests />;
  return <FriendsEmpty isDisabled={!isOnline} onInvite={onInvite} />;
};

export default FriendsListEmpty;
