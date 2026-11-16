import { createArenaSocket, WS_CLOSE_TOKEN } from "./arena-socket";
import type { WsSocketHandlers, WsTransport } from "./ws-transport";

const createTransport = () => {
  const opened: { url: string; headers: Record<string, string>; handlers: WsSocketHandlers }[] = [];
  const transport: WsTransport = (url, headers, handlers) => {
    opened.push({ url, headers, handlers });
    return { close: jest.fn() };
  };
  return { transport, opened, last: () => opened.at(-1) };
};

const MATCH = {
  id: "m1",
  seq: 4,
  status: "play",
  server_time: "2026-11-02T12:00:00Z",
  deadline: "2026-11-02T12:00:07Z",
  my_map: { rows: 6 },
};

describe("createArenaSocket", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const setup = (refreshToken = jest.fn(async () => undefined)) => {
    const transport = createTransport();
    const token = { isExpired: false };
    const socket = createArenaSocket({
      transport: transport.transport,
      url: "ws://api/v1/arena/ws",
      headers: () => ({ Authorization: "Bearer t1", "Accept-Language": "ru" }),
      isTokenExpired: () => token.isExpired,
      refreshToken,
    });
    return { ...transport, socket, refreshToken, token };
  };

  const settle = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  test("connects with the bearer header and the language", () => {
    const { socket, last } = setup();

    socket.open();

    expect(last()).toEqual(
      expect.objectContaining({
        url: "ws://api/v1/arena/ws",
        headers: { Authorization: "Bearer t1", "Accept-Language": "ru" },
      }),
    );
  });

  test("passes validated events in camel case and skips malformed ones", () => {
    const { socket, last } = setup();
    const events: unknown[] = [];
    socket.onEvent((event) => events.push(event));
    socket.open();

    last()?.handlers.onMessage("not json");
    last()?.handlers.onMessage(JSON.stringify({ type: "ping", time: "x" }));
    last()?.handlers.onMessage(
      JSON.stringify({ type: "match", time: "2026-11-02T12:00:00Z", match: MATCH }),
    );

    expect(events).toEqual([
      expect.objectContaining({
        type: "match",
        match: expect.objectContaining({ seq: 4, myMap: { rows: 6 } }),
      }),
    ]);
  });

  test("passes presence pushes and drops challenges, which are not read yet", () => {
    const { socket, last } = setup();
    const events: unknown[] = [];
    socket.onEvent((event) => events.push(event));
    socket.open();

    last()?.handlers.onMessage(
      JSON.stringify({
        type: "presence",
        time: "2026-11-02T12:00:00Z",
        presence: { match_id: "m1", online: false },
      }),
    );
    last()?.handlers.onMessage(
      JSON.stringify({
        type: "challenge",
        time: "2026-11-02T12:00:00Z",
        challenge: { id: "c1", status: "pending" },
      }),
    );

    expect(events).toEqual([
      expect.objectContaining({ type: "presence", presence: { matchId: "m1", online: false } }),
    ]);
  });

  test("refreshes the token on 4001 and connects again", async () => {
    const { socket, opened, refreshToken } = setup();
    socket.open();

    opened[0]?.handlers.onClose(WS_CLOSE_TOKEN);
    await Promise.resolve();
    await Promise.resolve();

    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(opened).toHaveLength(2);
  });

  test("backs off after 1013 and reports the reconnect, so the match is re-read", () => {
    const { socket, opened } = setup();
    const reconnected = jest.fn();
    socket.onReconnect(reconnected);
    socket.open();
    opened[0]?.handlers.onOpen();

    opened[0]?.handlers.onClose(1013);

    expect(opened).toHaveLength(1);

    jest.advanceTimersByTime(1500);
    opened[1]?.handlers.onOpen();

    expect(opened).toHaveLength(2);
    expect(reconnected).toHaveBeenCalledTimes(1);
  });

  test("stays closed after close", () => {
    const { socket, opened } = setup();
    socket.open();
    socket.close();

    opened[0]?.handlers.onClose(1006);
    jest.advanceTimersByTime(10_000);

    expect(opened).toHaveLength(1);
  });

  test("refreshes an expired token before connecting", async () => {
    const refreshToken = jest.fn(async () => undefined);
    const { socket, opened, token } = setup(refreshToken);
    token.isExpired = true;
    refreshToken.mockImplementation(async () => {
      token.isExpired = false;
    });

    socket.open();
    expect(opened).toHaveLength(0);
    await settle();

    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(opened).toHaveLength(1);
  });

  test("refreshes a token that expired in the background on resume", async () => {
    const { socket, opened, refreshToken, token } = setup();
    socket.open();
    opened[0]?.handlers.onOpen();
    socket.suspend();
    token.isExpired = true;

    socket.resume();
    await settle();

    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(opened).toHaveLength(2);
  });
});
