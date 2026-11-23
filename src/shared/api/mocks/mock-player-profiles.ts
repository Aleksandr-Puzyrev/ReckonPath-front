import type { components } from "../generated/schema";

import { mockNickname } from "./me-handlers";
import { mockHistory } from "./mock-arena";
import type { MockReply } from "./mock-campaign-play";
import { MOCK_ME_ID, mockFriendStatus, mockPlayerOf, mockRelationOf } from "./mock-friends";

type PlayerProfile = components["schemas"]["PlayerProfile"];
type HistoryItem = components["schemas"]["HistoryItem"];

const HTTP_NOT_FOUND = 404;
const HUNDRED = 100;
const RANK_BASE = 5000;
const STATS_DIVISOR = 40;
const PEAK_BONUS = 120;

const titleOf = (league: string) => `${league.slice(0, 1).toUpperCase()}${league.slice(1)}`;

const countOf = (items: readonly HistoryItem[], outcome: HistoryItem["outcome"]) =>
  items.filter((item) => item.outcome === outcome).length;

// The dev numbers are derived from the trophies, so every player looks alike from launch to launch (числа для разработки выводятся из кубков, чтобы игрок выглядел одинаково от запуска к запуску).
const statsOf = (trophies: number) => {
  const wins = Math.round(trophies / STATS_DIVISOR);
  const losses = Math.round(wins / 2);
  const matches = wins + losses;
  return {
    matches,
    wins,
    losses,
    draws: 0,
    winRate: matches === 0 ? 0 : Math.floor((wins * HUNDRED) / matches),
    streak: wins % 5,
    bestStreak: (wins % 5) + 3,
    peak: trophies + PEAK_BONUS,
  };
};

// Like the backend: no head to head for myself or a blocked player, online only for a friend (как у бэкенда: без личных встреч с собой и заблокированным, «в сети» только у друга).
export const mockPlayerProfile = (id: string): MockReply<PlayerProfile> => {
  if (id === MOCK_ME_ID) {
    return {
      data: {
        id,
        name: mockNickname(),
        trophies: 0,
        rank: RANK_BASE,
        league: { league: "bronze", title: "Bronze", division: "III", min: 0 },
        look: {},
        stats: statsOf(0),
        relation: "self",
      },
    };
  }
  const player = mockPlayerOf(id);
  if (player === undefined) return { error: "player_not_found", status: HTTP_NOT_FOUND };
  const relation = mockRelationOf(id);
  const meetings = mockHistory.filter(({ rival }) => rival.id === id);
  const status = mockFriendStatus(id);
  return {
    data: {
      id,
      name: player.name,
      trophies: player.trophies,
      rank: Math.max(1, RANK_BASE - player.trophies),
      league: {
        league: player.league,
        title: titleOf(player.league),
        division: "I",
        min: Math.floor(player.trophies / HUNDRED) * HUNDRED,
      },
      look: {},
      stats: statsOf(player.trophies),
      relation,
      ...(relation === "blocked"
        ? {}
        : {
            headToHead: {
              wins: countOf(meetings, "win"),
              losses: countOf(meetings, "loss"),
              draws: countOf(meetings, "draw"),
              last: meetings,
            },
          }),
      ...(status === undefined ? {} : { online: status !== "offline" }),
    },
  };
};
