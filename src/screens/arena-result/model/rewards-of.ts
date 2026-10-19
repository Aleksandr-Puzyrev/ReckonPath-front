import type { MatchEnd } from "@entities/match";

export type RewardItem =
  | { kind: "rp"; amount: number }
  | { kind: "coin"; amount: number }
  | { kind: "emerald"; amount: number }
  | { kind: "xp"; amount: number };

const amountOf = (value: unknown) => (typeof value === "number" ? value : 0);

// Server rewards are open objects; known kinds are shown, others are skipped (награды сервера — открытые объекты; известные виды показываются, остальные пропускаются).
export const rewardsOf = ({ rp, rewards }: MatchEnd): RewardItem[] => [
  ...(rp > 0 ? [{ kind: "rp" as const, amount: rp }] : []),
  ...rewards.flatMap((reward): RewardItem[] => {
    if (reward.currency === "coin") return [{ kind: "coin", amount: amountOf(reward.amount) }];
    if (reward.currency === "emerald")
      return [{ kind: "emerald", amount: amountOf(reward.amount) }];
    if (typeof reward.xp === "number") return [{ kind: "xp", amount: reward.xp }];
    return [];
  }),
];
