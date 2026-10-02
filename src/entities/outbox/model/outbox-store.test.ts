import { attemptFixture } from "@shared/test-utils/attempt-fixture";

import { useOutboxStore } from "./outbox-store";

const outbox = () => useOutboxStore.getState();

afterEach(() => outbox().reset());

describe("useOutboxStore", () => {
  test("queues finished attempts in order", () => {
    const first = attemptFixture();
    const second = attemptFixture();

    outbox().enqueue(first);
    outbox().enqueue(second);

    expect(outbox().attempts).toEqual([first, second]);
  });

  test("removes the sent attempts only", () => {
    const sent = attemptFixture();
    const waiting = attemptFixture();
    outbox().enqueue(sent);
    outbox().enqueue(waiting);

    outbox().remove([sent.attemptId]);

    expect(outbox().attempts).toEqual([waiting]);
  });

  test("reset empties the queue", () => {
    outbox().enqueue(attemptFixture());

    outbox().reset();

    expect(outbox().attempts).toEqual([]);
  });

  test("drops only the broken records on migration", async () => {
    const valid = attemptFixture();
    const migrate = useOutboxStore.persist.getOptions().migrate;

    expect(await migrate?.({ attempts: [valid, { attemptId: 5 }] }, 0)).toEqual({
      attempts: [valid],
    });
  });

  test("starts empty from a corrupt saved queue", async () => {
    const migrate = useOutboxStore.persist.getOptions().migrate;

    expect(await migrate?.("broken", 0)).toEqual({ attempts: [] });
  });
});
