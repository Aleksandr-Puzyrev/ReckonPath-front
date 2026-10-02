import { setItemAsync } from "expo-secure-store";
import { http, HttpResponse } from "msw/http";

import { useDailyRecordStore } from "@entities/daily";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { ApiError } from "@shared/api";
import { attemptFixture } from "@shared/test-utils/attempt-fixture";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { syncAttempts } from "./sync-attempts";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const signIn = () => setItemAsync("reckon-path.refresh-token", "r_saved");

const queue = (count: number) =>
  Array.from({ length: count }, () => useOutboxStore.getState().enqueue(attemptFixture()));

const countBatches = () => {
  const sizes: number[] = [];
  mockServer.use(
    http.post(mockUrl("/attempts:batch"), async ({ request }) => {
      const body: unknown = await request.clone().json();
      if (
        typeof body === "object" &&
        body !== null &&
        "attempts" in body &&
        Array.isArray(body.attempts)
      ) {
        sizes.push(body.attempts.length);
      }
      return undefined;
    }),
  );
  return sizes;
};

const answerBatch = (status: number) =>
  mockServer.use(
    http.post(mockUrl("/attempts:batch"), () =>
      HttpResponse.json({ error: { code: "VALIDATION" } }, { status }),
    ),
  );

afterEach(() => {
  mockServer.reset();
  secureStore.__reset();
  useOutboxStore.getState().reset();
  useProgressStore.getState().reset();
  useDailyRecordStore.getState().reset();
});

describe("syncAttempts", () => {
  test("sends five offline attempts in one batch (LVL-26)", async () => {
    await signIn();
    queue(5);
    const batches = countBatches();

    await syncAttempts();

    expect(batches).toEqual([5]);
    expect(useOutboxStore.getState().attempts).toEqual([]);
  });

  test("splits the queue into batches of 50", async () => {
    await signIn();
    queue(120);
    const batches = countBatches();

    await syncAttempts();

    expect(batches).toEqual([50, 50, 20]);
  });

  test("waits without a session (ACC-03)", async () => {
    queue(2);
    const batches = countBatches();

    await syncAttempts();

    expect(batches).toEqual([]);
    expect(useOutboxStore.getState().attempts).toHaveLength(2);
  });

  test("drops a batch the server rejected", async () => {
    await signIn();
    queue(2);
    answerBatch(400);

    await syncAttempts();

    expect(useOutboxStore.getState().attempts).toEqual([]);
  });

  test.each([500, 429, 426])("keeps the batch for a retry on %i", async (status) => {
    await signIn();
    queue(2);
    answerBatch(status);

    await expect(syncAttempts()).rejects.toBeInstanceOf(ApiError);

    expect(useOutboxStore.getState().attempts).toHaveLength(2);
  });

  test("keeps the batch when the network fails", async () => {
    await signIn();
    queue(2);
    mockServer.use(http.post(mockUrl("/attempts:batch"), () => HttpResponse.error()));

    await expect(syncAttempts()).rejects.toThrow();

    expect(useOutboxStore.getState().attempts).toHaveLength(2);
  });

  test("takes the stars from the server after sending", async () => {
    await signIn();
    useOutboxStore
      .getState()
      .enqueue(attemptFixture({ ref: "c-2", claimed: { result: "won", movesUsed: 4, stars: 2 } }));

    await syncAttempts();

    expect(useProgressStore.getState().best).toEqual({ "c-2": { stars: 2, moves: 4 } });
  });

  test("keeps the server's place of the counted daily attempt", async () => {
    await signIn();
    const daily = attemptFixture({ mode: "daily", ref: "d-2026-09-28" });
    useDailyRecordStore.getState().recordCounted("2026-09-28", {
      attemptId: daily.attemptId,
      result: "won",
      movesUsed: 1,
      stars: 3,
      durationMs: 1,
    });
    useOutboxStore.getState().enqueue(daily);

    await syncAttempts();

    expect(useDailyRecordStore.getState().days["2026-09-28"]).toMatchObject({
      rank: 134,
      percentile: 88,
    });
  });
});
