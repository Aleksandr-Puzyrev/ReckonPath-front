import { keyValueStorage } from "@shared/storage";

import { useOfflineCampaign } from "./offline-campaign-store";
import type { CampaignPack, PendingAttempt } from "./offline-campaign-store";
import { canResumeOffline, isPackCurrent, nextOfflineLevel } from "./offline-pack";

const pack: CampaignPack = {
  packId: "pack",
  expiresAt: "2026-12-01T00:00:00.000Z",
  clockOffset: 0,
  completed: [],
  levels: [2, 3].map((number) => ({ number, version: 1, nonce: "nonce", data: "sealed-data" })),
};

const finish = (id: string, level: number, won = true): PendingAttempt => ({
  id,
  packId: pack.packId,
  level,
  version: 1,
  won,
  startedAt: "2026-11-26T00:00:00.000Z",
  finishedAt: "2026-11-26T00:00:10.000Z",
  taps: [[0, 1]],
});

const storage = useOfflineCampaign.getState;

describe("offline campaign", () => {
  beforeEach(() => {
    storage().reset();
    storage().bind("first-player");
    storage().setPack(pack);
  });
  afterEach(() => storage().reset());

  test("restores the unfinished attempt and completed outbox after process restart", async () => {
    storage().finish(finish("sent-later", 2));
    const { finishedAt: _end, won: _won, ...playing } = finish("still-playing", 3);
    storage().save(playing);
    const persisted = keyValueStorage.getItem("offline-campaign");
    expect(persisted).not.toBeNull();
    if (persisted === null) return;

    storage().reset();
    keyValueStorage.setItem("offline-campaign", persisted);
    await useOfflineCampaign.persist.rehydrate();

    expect(storage().active).toEqual(playing);
    expect(storage().pending.map(({ id }) => id)).toEqual(["sent-later"]);
  });

  test("unlocks the next level locally and does not unlock twice on repeated acknowledgement", () => {
    storage().finish(finish("attempt", 2));
    expect(nextOfflineLevel(pack, storage().pending)).toBe(3);

    storage().confirm([{ id: "attempt", status: "won" }]);
    storage().confirm([{ id: "attempt", status: "won" }]);

    expect(storage().pack?.completed).toEqual([2]);
    expect(storage().pending).toEqual([]);
  });

  test("retains unanswered attempts and reopens a provisionally cleared level when rejected", () => {
    storage().finish(finish("failed", 2));
    storage().finish(finish("unanswered", 3, false));

    storage().confirm([{ id: "failed", status: "rejected" }]);

    expect(nextOfflineLevel(pack, storage().pending)).toBe(2);
    expect(storage().pending.map(({ id }) => id)).toEqual(["unanswered"]);
    expect(storage().rejected).toBe(1);
  });

  test("does not expose a previous player's levels or attempts when switching accounts", () => {
    storage().finish(finish("attempt", 2));

    storage().bind("second-player");

    expect(storage().pack).toBeNull();
    expect(storage().pending).toEqual([]);
  });

  test("closes starting new attempts at expiry and limits resuming to the server grace period", () => {
    const expiry = Date.parse(pack.expiresAt);
    expect(isPackCurrent(pack, expiry - 1)).toBe(true);
    expect(isPackCurrent(pack, expiry)).toBe(false);
    expect(canResumeOffline(pack, expiry)).toBe(true);
    expect(canResumeOffline(pack, Date.parse("2026-12-02T00:00:00.000Z"))).toBe(false);
  });
});
