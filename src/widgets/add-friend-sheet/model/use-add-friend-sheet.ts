import { useState } from "react";
import { useTranslation } from "react-i18next";

import { searchNicknameOf, useFriendSearchQuery, useInviteQuery } from "@entities/friend";
import { useSendFriendRequest } from "@features/send-friend-request";
import { errorMessageKey } from "@shared/api";
import { useDebouncedValue } from "@shared/lib";

const SEARCH_DEBOUNCE_MS = 300;

export const useAddFriendSheet = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const nickname = useDebouncedValue(searchNicknameOf(text), SEARCH_DEBOUNCE_MS);
  const search = useFriendSearchQuery(nickname);
  const invite = useInviteQuery();
  const send = useSendFriendRequest({
    onBefriended: (name) => onToast(t("friends.accepted", { name })),
    onError: (messageKey) => onToast(t(messageKey)),
  });

  return {
    text,
    isSearching: searchNicknameOf(text) !== null,
    players: nickname === null ? undefined : search.data,
    errorKey: nickname !== null && search.isError ? errorMessageKey(search.error) : null,
    invite: invite.data,
    pendingUserId: send.pendingUserId,
    handleTextChange: setText,
    handleSend: send.send,
    handleReset: () => setText(""),
  };
};
