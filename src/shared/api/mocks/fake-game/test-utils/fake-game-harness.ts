import type { ClientMessage, ServerMessage } from "../../../../ws/generated/messages";
import { apiClient } from "../../../api-client";
import type { components } from "../../../generated/schema";
import { FAKE_WS_ORIGIN, fakeGameServer } from "../fake-game-server";
import type { FakeGameOptions } from "../fake-game-server";
import { INTRO_MS } from "../match-room";

type PvpMap = components["schemas"]["PvpMap"];
type MessageOf<T extends ServerMessage["t"]> = Extract<ServerMessage, { t: T }>;

export const MY_MAP: PvpMap = { rows: 5, cols: 5, targets: [[4, 4]], bombs: [[4, 0]] };
export const OPPONENT_MAP: PvpMap = { rows: 5, cols: 5, targets: [[2, 2]], bombs: [[0, 0]] };
export const SEARCH_MS = 20_000;

export const saveActiveMap = async (map = MY_MAP) => {
  const { data } = await apiClient.POST("/arena/maps", {
    body: { name: "Fort", format: 5, map },
  });
  const id = data?.id ?? "";
  await apiClient.POST("/arena/maps/{id}/activate", { params: { path: { id } } });
  return id;
};

export const connectPeer = (url: string) => {
  const messages: ServerMessage[] = [];
  const closes: { code: number; reason: string }[] = [];
  const connection = fakeGameServer.connect(url, {
    deliver: (message) => messages.push(message),
    close: (code, reason) => closes.push({ code, reason }),
  });
  const of = <T extends ServerMessage["t"]>(type: T) =>
    messages.filter((message): message is MessageOf<T> => message.t === type);
  return {
    messages,
    closes,
    of,
    last: <T extends ServerMessage["t"]>(type: T) => of(type).at(-1),
    send: (message: ClientMessage) => connection.receive(JSON.stringify(message)),
    disconnect: connection.disconnect,
  };
};

export type Peer = ReturnType<typeof connectPeer>;

export const ENTRY_URL = `${FAKE_WS_ORIGIN}/v1/ws?token=t`;

export const joinQueue = (entry: Peer, mapId: string, id = "join") =>
  entry.send({ t: "queue.join", id, d: { format: 5, mapId } });

export const startMatch = async (options: Partial<FakeGameOptions> = {}) => {
  const mapId = await saveActiveMap();
  jest.useFakeTimers();
  fakeGameServer.configure({ opponentMap: OPPONENT_MAP, first: "me", ...options });
  const entry = connectPeer(ENTRY_URL);
  joinQueue(entry, mapId);
  await jest.advanceTimersByTimeAsync(SEARCH_MS);
  const found = entry.last("match.found");
  if (found === undefined) throw new Error("No match was found");
  const match = connectPeer(`${found.d.endpoint}?ticket=${found.d.ticket}`);
  await jest.advanceTimersByTimeAsync(INTRO_MS);
  return { entry, match, found, mapId };
};

export const tap = (peer: Peer, cell: [number, number], id = "tap") => {
  const turn = peer.last("match.turn")?.d.turn ?? 0;
  peer.send({ t: "match.tap", id, d: { turn, cell } });
};
