const MEDALS = ["gold", "silver", "bronze"] as const;

export const medalOf = (rank: number | null) =>
  rank === null ? "none" : (MEDALS[rank - 1] ?? "none");
