import { useIsRestoring, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { campaignQueryOptions, invalidateCampaignProgress } from "@entities/level";
import {
  canResumeOffline,
  discardPackKey,
  downloadOfflinePackOptions,
  isPackCurrent,
  nextOfflineLevel,
  syncOfflineCampaignOptions,
  useOfflineCampaign,
} from "@entities/offline-campaign";
import { useAccountStore } from "@entities/session";
import { applyWallet, meQueryOptions, walletKeys } from "@entities/wallet";
import { isApiError, useIsOnline } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";

const MAX_BATCH = 30;
const REFRESH_INTERVAL = 60_000;
const PACK_RETRY_INTERVAL = 15 * REFRESH_INTERVAL;

const useLocalOwner = (owner: string | undefined) => {
  useEffect(() => {
    if (owner === undefined) return;
    const state = useOfflineCampaign.getState();
    if (state.owner !== owner && state.pack !== null) {
      void discardPackKey(state.pack.packId).catch(() => undefined);
    }
    state.bind(owner);
  }, [owner]);
};

const OfflineCampaignHost = ({ canSync }: { canSync: boolean }) => {
  const client = useQueryClient();
  const hasLogin = useAccountStore((state) => state.hasLogin);
  const online = useIsOnline();
  const restoring = useIsRestoring();
  const isEnabled = canSync && hasLogin && !restoring && online;
  const { data: me } = useQuery({ ...meQueryOptions(), enabled: isEnabled });
  const { data: overview } = useQuery({ ...campaignQueryOptions(), enabled: isEnabled });
  const owner = hasLogin && HAS_BACKEND ? me?.id : undefined;
  const pendingCount = useOfflineCampaign((state) => state.pending.length);
  useLocalOwner(owner);

  const downloading = useMutation(downloadOfflinePackOptions());
  const syncing = useMutation(syncOfflineCampaignOptions());
  const busy = useRef(false);
  const lastDownload = useRef<{ owner: string; at: number } | null>(null);
  const sync = syncing.mutateAsync;
  const download = downloading.mutateAsync;
  const current = overview?.currentLevel;

  useEffect(() => {
    if (!HAS_BACKEND || restoring || !hasLogin) return;
    return useAccountStore.subscribe((next, previous) => {
      if (next.hasLogin || !previous.hasLogin) return;
      const state = useOfflineCampaign.getState();
      if (state.pack !== null) void discardPackKey(state.pack.packId).catch(() => undefined);
      state.reset();
    });
  }, [hasLogin, restoring]);

  useEffect(() => {
    if (!canSync || !online || restoring || owner === undefined) return;
    const isCurrentOwner = () =>
      useAccountStore.getState().hasLogin && useOfflineCampaign.getState().owner === owner;

    const run = async () => {
      if (busy.current || !isCurrentOwner()) return;
      busy.current = true;
      try {
        const state = useOfflineCampaign.getState();
        if (state.pending.length > 0) {
          const batch = [...state.pending]
            .sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
            .slice(0, MAX_BATCH);
          const result = await sync(batch.map(({ won: _won, ...entry }) => entry));
          if (!isCurrentOwner()) return;
          state.setSyncBlocked(false);
          state.confirm(result.results);
          applyWallet(client, { coins: result.wallet.coins, emeralds: result.wallet.gems });
          await Promise.all([
            invalidateCampaignProgress(client),
            client.invalidateQueries({ queryKey: walletKeys.all, exact: true }),
          ]);
          return;
        }
        if (current !== undefined) state.advanceTo(current);
        const pack = useOfflineCampaign.getState().pack;
        if (
          (state.active !== null && pack !== null && canResumeOffline(pack)) ||
          (pack !== null && isPackCurrent(pack) && nextOfflineLevel(pack, []) !== undefined)
        )
          return;
        const last = lastDownload.current;
        if (last?.owner === owner && Date.now() - last.at < PACK_RETRY_INTERVAL) return;
        lastDownload.current = { owner, at: Date.now() };
        const saved = await download();
        if (!isCurrentOwner()) {
          if (saved !== null) await discardPackKey(saved.packId);
          return;
        }
        state.setPack(saved);
        if (pack !== null && pack.packId !== saved?.packId) await discardPackKey(pack.packId);
      } catch (error) {
        // Transport errors preserve the queue. A rejected attempt is handled by its explicit server result.
        if (isApiError(error) && error.status === 422 && isCurrentOwner()) {
          const state = useOfflineCampaign.getState();
          if (state.pending.length > 0) state.setSyncBlocked(true);
        }
      } finally {
        busy.current = false;
      }
    };

    void run();
    const interval = setInterval(() => void run(), REFRESH_INTERVAL);
    const app = AppState.addEventListener("change", () => void run());
    return () => {
      clearInterval(interval);
      app.remove();
    };
  }, [canSync, client, current, download, online, owner, pendingCount, restoring, sync]);

  return null;
};

export default OfflineCampaignHost;
