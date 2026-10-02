import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 1;
const SOFT_UPDATE_SNOOZE_MS = 24 * 60 * 60_000;

interface PersistedNotices {
  softUpdateDismissedAt: number | null;
}

interface SystemNoticeState extends PersistedNotices {
  isMaintenanceDismissed: boolean;
  dismissMaintenance: () => void;
  dismissSoftUpdate: () => void;
  reset: () => void;
}

const PERSISTED_DEFAULTS: PersistedNotices = { softUpdateDismissedAt: null };

const persistedNoticesSchema = z.object({ softUpdateDismissedAt: z.number().nullable() });

export const isSoftUpdateSnoozed = (dismissedAt: number | null, now: number) =>
  dismissedAt !== null && now - dismissedAt < SOFT_UPDATE_SNOOZE_MS;

// Maintenance is dismissed until the next launch, the soft update for a day (техработы скрываются до следующего запуска, мягкое обновление — на сутки).
export const useSystemNoticeStore = create<SystemNoticeState>()(
  persist(
    (set) => ({
      ...PERSISTED_DEFAULTS,
      isMaintenanceDismissed: false,
      dismissMaintenance: () => set({ isMaintenanceDismissed: true }),
      dismissSoftUpdate: () => set({ softUpdateDismissedAt: Date.now() }),
      reset: () => set({ ...PERSISTED_DEFAULTS, isMaintenanceDismissed: false }),
    }),
    {
      name: "system-notices",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ softUpdateDismissedAt }): PersistedNotices => ({ softUpdateDismissedAt }),
      migrate: (persisted) => persistedNoticesSchema.catch(PERSISTED_DEFAULTS).parse(persisted),
    },
  ),
);
