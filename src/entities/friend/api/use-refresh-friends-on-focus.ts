import { useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { useEffect, useEffectEvent, useRef } from "react";

import { friendKeys } from "./friend-queries";

// The first focus is served by the query itself; coming back to Profile or Friends re-reads the requests behind the Profile tab dot (первый фокус обслуживает сам запрос; возврат в «Профиль» или «Друзья» перечитывает заявки, от которых зависит точка вкладки).
export const useRefreshFriendsOnFocus = () => {
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const wasFocusedRef = useRef(isFocused);
  const refresh = useEffectEvent(
    () => void queryClient.invalidateQueries({ queryKey: friendKeys.list() }),
  );

  useEffect(() => {
    if (isFocused && !wasFocusedRef.current) refresh();
    wasFocusedRef.current = isFocused;
  }, [isFocused]);
};
