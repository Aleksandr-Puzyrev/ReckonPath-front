import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw/http";

import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { matchDetailsQueryOptions, matchHistoryQueryOptions } from "./match-queries";

const row = (matchId: string) => ({
  matchId,
  mode: "ranked",
  opponent: { id: "u2", nickname: "Kira", league: "GOLD", isBot: false, label: null },
  result: "win",
  reason: "targets",
  turns: { me: 9, opponent: 10 },
  trophiesDelta: 16,
  endedAt: "2026-10-17T12:00:00Z",
});

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

describe("matchHistoryQueryOptions", () => {
  afterEach(() => mockServer.reset());

  test("loads the next page by the server's cursor", async () => {
    const cursors: (string | null)[] = [];
    mockServer.use(
      http.get(mockUrl("/arena/matches"), ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        cursors.push(cursor);
        return HttpResponse.json(
          cursor === null
            ? { items: [row("m1")], nextCursor: "c2" }
            : { items: [row("m2")], nextCursor: null },
        );
      }),
    );

    const history = await createClient().fetchInfiniteQuery({
      ...matchHistoryQueryOptions(),
      pages: 2,
    });

    expect(cursors).toEqual([null, "c2"]);
    expect(history.pages.flatMap(({ items }) => items.map(({ matchId }) => matchId))).toEqual([
      "m1",
      "m2",
    ]);
  });
});

describe("matchDetailsQueryOptions", () => {
  afterEach(() => mockServer.reset());

  test("loads both maps and every tap of a match (decision 0029 #3)", async () => {
    const map = { rows: 5, cols: 5, targets: [[1, 1]] };
    const tap = { turn: 1, player: "me", cell: [1, 1], outcome: "target", value: null };
    mockServer.use(
      http.get(mockUrl("/arena/matches/m1"), () =>
        HttpResponse.json({ ...row("m1"), maps: { mine: map, opponent: map }, taps: [tap] }),
      ),
    );

    const details = await createClient().fetchQuery(matchDetailsQueryOptions("m1"));

    expect(details.taps).toEqual([tap]);
    expect(details.maps.opponent).toEqual(map);
  });
});
