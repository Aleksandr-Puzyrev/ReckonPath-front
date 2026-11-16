import type { MatchResultView } from "@entities/match";

export type RewardItem =
  | { kind: "rp"; amount: number }
  | { kind: "coin"; amount: number }
  | { kind: "emerald"; amount: number }
  | { kind: "xp"; amount: number };

export const rewardsOf = ({ rp, coins, gems, xp }: MatchResultView): RewardItem[] =>
  (
    [
      { kind: "rp", amount: rp },
      { kind: "coin", amount: coins },
      { kind: "emerald", amount: gems },
      { kind: "xp", amount: xp },
    ] as const
  ).filter(({ amount }) => amount > 0);
