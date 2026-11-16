import type { ArenaEvent } from "@shared/ws";

import { useMatchStore } from "./match-store";
import type { MatchView } from "./match-type";

export interface MatchEventSource {
  open: () => void;
  close: () => void;
  onEvent: (listener: (event: ArenaEvent) => void) => () => void;
  onReconnect: (listener: () => void) => () => void;
}

const store = () => useMatchStore.getState();

// The socket is open while any arena screen uses it; after every reconnect the live match is re-read, because pushes may have been missed (сокет открыт, пока его использует хоть один экран арены; после каждого переподключения живой матч перечитывается — пуши могли потеряться).
export const createMatchSession = (
  source: MatchEventSource,
  loadCurrent: () => Promise<MatchView | null>,
) => {
  let users = 0;
  let unbind: (() => void) | null = null;

  const refresh = async () => {
    try {
      const view = await loadCurrent();
      if (view !== null) store().receive(view);
    } catch {
      // TODO: report failed match refreshes to Sentry once it is set up
    }
  };

  const handle = ({ type, match, queue, presence }: ArenaEvent) => {
    if (type === "match" && match !== undefined) store().receive(match);
    if (type === "presence" && presence !== undefined) {
      store().receivePresence(presence.matchId, presence.online);
    }
    if (type !== "queue" || queue === undefined) return;
    store().receiveQueue(queue.queue ?? null);
    if (queue.match !== undefined) void refresh();
  };

  const bind = () => {
    const offEvent = source.onEvent(handle);
    const offReconnect = source.onReconnect(() => void refresh());
    source.open();
    return () => {
      offEvent();
      offReconnect();
      source.close();
    };
  };

  return {
    refresh,
    retain: () => {
      users += 1;
      unbind ??= bind();
      return () => {
        users -= 1;
        if (users > 0) return;
        unbind?.();
        unbind = null;
      };
    },
  };
};
