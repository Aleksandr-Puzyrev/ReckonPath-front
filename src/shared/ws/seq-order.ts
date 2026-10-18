export type SeqVerdict = "deliver" | "stale" | "gap";

export const checkSeq = (lastSeq: number | null, seq: number | undefined): SeqVerdict => {
  if (seq === undefined || lastSeq === null || seq === lastSeq + 1) return "deliver";
  return seq <= lastSeq ? "stale" : "gap";
};
