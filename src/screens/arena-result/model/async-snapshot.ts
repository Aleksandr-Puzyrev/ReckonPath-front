import { leagueOf } from "@reckon-path/engine";

import { useAsyncMatchStore } from "@entities/match";
import type { MatchEnd, MatchOpponent, MatchTap } from "@entities/match";

// An async result is shaped like a live one, so the result screen draws both (асинхронный итог приводится к форме живого, чтобы экран итога рисовал оба).
export const asyncSnapshot = () => {
  const { match, finish, taps, trophiesBefore } = useAsyncMatchStore.getState();
  if (match === null || finish === null) return null;
  const after = Math.max(0, trophiesBefore + finish.trophiesDelta);
  const end: MatchEnd = {
    result: finish.result,
    reason: "targets",
    turns: { me: finish.turnsUsed, opponent: finish.norm },
    maps: { mine: { targets: [], bombs: [] }, opponent: finish.map },
    trophies: { before: trophiesBefore, after, delta: after - trophiesBefore },
    league: { changed: leagueOf(trophiesBefore) !== leagueOf(after) },
    rp: finish.rp,
    rewards: finish.rewards,
  };
  const opponent: MatchOpponent = {
    id: match.author.id,
    nickname: match.author.nickname,
    league: match.author.league,
    trophies: trophiesBefore,
    isBot: false,
    label: null,
  };
  const myTaps: MatchTap[] = taps.map(({ cell, outcome, value, bombNear }, index) => ({
    turn: index + 1,
    cell,
    outcome,
    value,
    bombNear,
  }));
  return {
    end,
    opponent,
    layout: match.map,
    myTaps,
    opponentTaps: [],
    format: {
      size: match.map.rows,
      targets: match.targetsCount,
      turnSec: match.turnSec,
      bombHint: match.bombHint,
      maxTurns: 0,
    },
    norm: finish.norm,
  };
};
