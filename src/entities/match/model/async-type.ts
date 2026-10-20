import type { components } from "@shared/api";

export type AsyncMatch = components["schemas"]["AsyncMatch"];
export type AsyncTapResult = components["schemas"]["AsyncTapResult"];
export type AsyncFinish = components["schemas"]["AsyncFinish"];
export type Cell = [number, number];

export const isAsyncFinish = (answer: AsyncTapResult | AsyncFinish): answer is AsyncFinish =>
  "finished" in answer;
