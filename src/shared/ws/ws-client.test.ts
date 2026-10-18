import type { ServerMessage } from "./generated/messages";
import { createWsClient, MATCH_BACKGROUND_CLOSE_MS } from "./ws-client";
import type { WsClosed } from "./ws-client";
import { PING_INTERVAL_MS, PONG_TIMEOUT_MS } from "./ws-connection";
import type { WsSocketHandlers, WsTransport } from "./ws-transport";

interface ScriptedSocket {
  url: string;
  handlers: WsSocketHandlers;
  sent: { t: string; id?: string; d?: unknown }[];
  isClosed: boolean;
}

const ORIGIN = "wss://game.test";
const ENDPOINT = "wss://game-3.test/v1/match/m1";

const setup = (token: string | null = "access") => {
  const sockets: ScriptedSocket[] = [];
  const transport: WsTransport = (url, handlers) => {
    const socket: ScriptedSocket = { url, handlers, sent: [], isClosed: false };
    sockets.push(socket);
    return {
      send: (data) => socket.sent.push(JSON.parse(data)),
      close: () => {
        socket.isClosed = true;
      },
    };
  };
  const tokens = { current: token };
  const refreshToken = jest.fn(async () => {
    tokens.current = "fresh";
  });
  const client = createWsClient({
    transport,
    origin: ORIGIN,
    accessToken: () => tokens.current,
    refreshToken,
  });
  const closed: WsClosed[] = [];
  client.onClosed((event) => closed.push(event));
  const last = () => {
    const socket = sockets.at(-1);
    if (socket === undefined) throw new Error("No socket was opened");
    return socket;
  };
  const receive = (message: unknown, socket = last()) =>
    socket.handlers.onMessage(JSON.stringify(message));
  return { client, sockets, last, receive, closed, refreshToken };
};

const turn = (seq: number) => ({
  t: "match.turn",
  seq,
  d: { turn: seq, player: "me", deadline: "2026-10-17T12:00:05.300Z" },
});

const openMatch = (context: ReturnType<typeof setup>) => {
  context.client.connectMatch(ENDPOINT, "ticket-1");
  context.last().handlers.onOpen();
  return context.last();
};

describe("createWsClient", () => {
  beforeEach(() => jest.useFakeTimers({ now: 1_000_000 }));

  afterEach(() => jest.useRealTimers());

  test("opens the common entry with the access token", () => {
    const { client, last } = setup();

    client.connect();

    expect(last().url).toBe(`${ORIGIN}/v1/ws?token=access`);
  });

  test("delivers valid messages by type and drops invalid ones (Part 8 §9.2)", () => {
    const context = setup();
    const statuses: ServerMessage[] = [];
    context.client.on("queue.status", (message) => statuses.push(message));
    context.client.connect();
    context.last().handlers.onOpen();

    context.receive({ t: "queue.status", d: { waitedSec: 3 } });
    context.last().handlers.onMessage("{not json");
    context.receive({ t: "queue.status", d: { waitedSec: 3, range: 100, asyncAvailable: false } });

    expect(statuses).toHaveLength(1);
  });

  test("sends a message with an id over the right connection", () => {
    const context = setup();
    context.client.connect();
    context.last().handlers.onOpen();
    const entry = context.last();
    const match = openMatch(context);

    const joinId = context.client.send("queue.join", { format: 7, mapId: "map_1" });
    const tapId = context.client.send("match.tap", { turn: 1, cell: [4, 2] });

    expect(entry.sent.at(-1)).toEqual({
      t: "queue.join",
      id: joinId,
      d: { format: 7, mapId: "map_1" },
    });
    expect(match.sent.at(-1)).toEqual({ t: "match.tap", id: tapId, d: { turn: 1, cell: [4, 2] } });
  });

  test("returns no id when the connection is not open", () => {
    const { client } = setup();

    expect(client.send("match.surrender")).toBeNull();
  });

  test("pings every 5 s and reconnects after 10 s without a pong", async () => {
    const context = setup();
    context.client.connect();
    context.last().handlers.onOpen();
    const first = context.last();

    await jest.advanceTimersByTimeAsync(PING_INTERVAL_MS);
    expect(first.sent.filter(({ t }) => t === "ping")).toHaveLength(2);

    await jest.advanceTimersByTimeAsync(PONG_TIMEOUT_MS - PING_INTERVAL_MS);
    expect(first.isClosed).toBe(true);
    await jest.advanceTimersByTimeAsync(600);
    expect(context.sockets).toHaveLength(2);
  });

  test("keeps the median clock offset of the last pings", () => {
    const context = setup();
    context.client.connect();
    context.last().handlers.onOpen();

    [400, 500, 9_000, 450, 480].forEach((offset) =>
      context.receive({ t: "pong", d: { c: Date.now(), s: Date.now() + offset } }),
    );

    expect(context.client.serverNow() - Date.now()).toBe(480);
  });

  test("backs off 0.5 → 1 → 2 → 4 s between reconnects", async () => {
    const context = setup();
    jest.spyOn(Math, "random").mockReturnValue(0);
    context.client.connect();

    for (const delay of [500, 1000, 2000, 4000]) {
      const count = context.sockets.length;
      context.last().handlers.onClose(1006, "");
      await jest.advanceTimersByTimeAsync(delay - 1);
      expect(context.sockets).toHaveLength(count);
      await jest.advanceTimersByTimeAsync(1);
      expect(context.sockets).toHaveLength(count + 1);
    }
    jest.restoreAllMocks();
  });

  test("resumes a match with the token and asks for a resync", async () => {
    const context = setup();
    openMatch(context);
    jest.spyOn(Math, "random").mockReturnValue(0);

    context.last().handlers.onClose(1006, "");
    await jest.advanceTimersByTimeAsync(500);
    context.last().handlers.onOpen();

    expect(context.sockets.map(({ url }) => url)).toEqual([
      `${ENDPOINT}?ticket=ticket-1`,
      `${ENDPOINT}?token=access&resume=1`,
    ]);
    expect(context.last().sent.map(({ t }) => t)).toEqual(["ping", "match.resync"]);
    jest.restoreAllMocks();
  });

  test("gives up on a match after 30 s without a connection", async () => {
    const context = setup();
    openMatch(context);

    for (let attempt = 0; attempt < 12; attempt += 1) {
      context.last().handlers.onClose(1006, "");
      await jest.advanceTimersByTimeAsync(5_000);
    }

    expect(context.closed).toEqual([{ scope: "match", code: 1006, reason: "" }]);
  });

  test("delivers match messages in seq order and resyncs on a gap", () => {
    const context = setup();
    const turns: number[] = [];
    context.client.on("match.turn", ({ d }) => turns.push(d.turn));
    const match = openMatch(context);

    context.receive(turn(1));
    context.receive(turn(1));
    context.receive(turn(3));

    context.receive(turn(4));

    expect(turns).toEqual([1]);
    expect(match.sent.filter(({ t }) => t === "match.resync")).toHaveLength(1);
  });

  test("continues from the seq of a snapshot", () => {
    const context = setup();
    const turns: number[] = [];
    context.client.on("match.turn", ({ d }) => turns.push(d.turn));
    openMatch(context);
    const snapshot = {
      t: "match.snapshot",
      seq: 7,
      d: {
        state: "playing",
        turn: 7,
        current: "me",
        deadline: "2026-10-17T12:00:05.300Z",
        opponent: { id: "u2", nickname: "Kira", league: "GOLD", trophies: 2710, isBot: false },
        format: { size: 7, targets: 2, turnSec: 7, bombHint: true, maxTurns: 40 },
        opponentMap: {},
        opponentBombs: 3,
        myTaps: [],
        opponentTaps: [],
        found: { me: 0, opponent: 0 },
      },
    };

    context.receive(snapshot);
    context.receive(turn(8));

    expect(turns).toEqual([8]);
  });

  test("refreshes the token and reconnects on 4001", async () => {
    const context = setup();
    context.client.connect();

    context.last().handlers.onClose(4001, "");
    await jest.advanceTimersByTimeAsync(0);

    expect(context.refreshToken).toHaveBeenCalled();
    expect(context.last().url).toBe(`${ORIGIN}/v1/ws?token=fresh`);
  });

  test("reports 4001 when the token refresh fails", async () => {
    const context = setup();
    context.refreshToken.mockRejectedValueOnce(new Error("offline"));
    context.client.connect();

    context.last().handlers.onClose(4001, "");
    await jest.advanceTimersByTimeAsync(0);

    expect(context.closed).toEqual([{ scope: "entry", code: 4001, reason: "" }]);
    expect(context.sockets).toHaveLength(1);
  });

  test("gives up on a second 4001 right after a refresh", async () => {
    const context = setup();
    context.client.connect();

    context.last().handlers.onClose(4001, "");
    await jest.advanceTimersByTimeAsync(0);
    context.last().handlers.onOpen();
    context.last().handlers.onClose(4001, "");
    await jest.advanceTimersByTimeAsync(0);

    expect(context.refreshToken).toHaveBeenCalledTimes(1);
    expect(context.closed).toEqual([{ scope: "entry", code: 4001, reason: "" }]);
  });

  test("opens one socket when the app returns during a backoff", async () => {
    const context = setup();
    context.client.connect();
    context.last().handlers.onOpen();
    context.last().handlers.onClose(1006, "");

    context.client.handleAppState("active");
    await jest.advanceTimersByTimeAsync(5_000);

    expect(context.sockets).toHaveLength(2);
  });

  test("moves the match to the node named on 4010", () => {
    const context = setup();
    openMatch(context);

    context.last().handlers.onClose(4010, "wss://game-5.test/v1/match/m1");

    expect(context.last().url).toBe("wss://game-5.test/v1/match/m1?token=access&resume=1");
  });

  test.each([4003, 4009, 4026, 4503])("reports close code %i to subscribers", (code) => {
    const context = setup();
    context.client.connect();

    context.last().handlers.onClose(code, "");

    expect(context.closed).toEqual([{ scope: "entry", code, reason: "" }]);
    expect(context.sockets).toHaveLength(1);
  });

  test("closes the entry at once in the background and reconnects on return", () => {
    const context = setup();
    context.client.connect();
    context.last().handlers.onOpen();

    context.client.handleAppState("background");
    expect(context.last().isClosed).toBe(true);
    context.client.handleAppState("active");

    expect(context.sockets).toHaveLength(2);
  });

  test("keeps a match open for 5 s in the background", async () => {
    const context = setup();
    const match = openMatch(context);

    context.client.handleAppState("background");
    await jest.advanceTimersByTimeAsync(MATCH_BACKGROUND_CLOSE_MS - 1);
    expect(match.isClosed).toBe(false);
    await jest.advanceTimersByTimeAsync(1);

    expect(match.isClosed).toBe(true);
  });

  test("reports a missing token instead of connecting", () => {
    const context = setup(null);

    context.client.connect();

    expect(context.sockets).toHaveLength(0);
    expect(context.closed).toEqual([{ scope: "entry", code: 4001, reason: "" }]);
  });
});
