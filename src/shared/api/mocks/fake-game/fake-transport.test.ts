import type { ServerMessage } from "../../../ws/generated/messages";
import { createWsClient } from "../../../ws/ws-client";
import { mockServer } from "../mock-server";

import { FAKE_WS_ORIGIN, fakeGameServer } from "./fake-game-server";
import { fakeTransport } from "./fake-transport";
import { INTRO_MS } from "./match-room";
import { OPPONENT_MAP, SEARCH_MS, saveActiveMap } from "./test-utils/fake-game-harness";

const createClient = () =>
  createWsClient({
    transport: fakeTransport,
    origin: FAKE_WS_ORIGIN,
    accessToken: () => "access",
    refreshToken: async () => undefined,
  });

describe("fakeTransport", () => {
  afterEach(() => {
    jest.useRealTimers();
    mockServer.reset();
  });

  test("plays a match through the WebSocket client", async () => {
    const mapId = await saveActiveMap();
    jest.useFakeTimers();
    fakeGameServer.configure({ opponentMap: OPPONENT_MAP, first: "me" });
    const client = createClient();
    const received: ServerMessage["t"][] = [];
    client.on("match.found", ({ d }) => client.connectMatch(d.endpoint, d.ticket));
    client.on("match.turn", ({ d }) => {
      if (d.player === "me") client.send("match.tap", { turn: d.turn, cell: [2, 2] });
    });
    (["match.state", "match.tapResult", "match.turn", "match.end"] as const).forEach((type) =>
      client.on(type, () => received.push(type)),
    );

    client.connect();
    await jest.advanceTimersByTimeAsync(0);
    client.send("queue.join", { format: 5, mapId });
    await jest.advanceTimersByTimeAsync(SEARCH_MS + INTRO_MS);

    expect(received.slice(0, 3)).toEqual(["match.state", "match.turn", "match.tapResult"]);
    client.disconnect();
  });

  test("closes the client socket with the server's code", async () => {
    jest.useFakeTimers();
    const client = createClient();
    const codes: number[] = [];
    client.onClosed(({ code }) => codes.push(code));

    client.connect();
    await jest.advanceTimersByTimeAsync(0);
    fakeGameServer.closeConnections(4003);
    await jest.advanceTimersByTimeAsync(0);

    expect(codes).toEqual([4003]);
  });
});
