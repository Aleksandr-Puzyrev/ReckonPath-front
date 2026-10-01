import { pick, randInt } from "../random/random";
import type { Rng } from "../random/random";

export const MAX_FULL_SPACE = 200_000;
export const SAMPLE_SIZE = 20_000;

const factorial = (value: number) => {
  let result = 1;
  for (let step = 2; step <= value; step += 1) result *= step;
  return result;
};

export const binomial = (n: number, k: number) => {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let step = 1; step <= k; step += 1) result = (result * (n - k + step)) / step;
  return Math.round(result);
};

export const spaceSize = (n: number, k: number, ordered: boolean) =>
  binomial(n, k) * (ordered ? factorial(k) : 1);

const nextPermutation = (values: number[]) => {
  let pivot = values.length - 2;
  while (pivot >= 0 && (values[pivot] ?? 0) >= (values[pivot + 1] ?? 0)) pivot -= 1;
  if (pivot < 0) return false;

  let swap = values.length - 1;
  while ((values[swap] ?? 0) <= (values[pivot] ?? 0)) swap -= 1;
  [values[pivot], values[swap]] = [values[swap] ?? 0, values[pivot] ?? 0];

  const tail = values.splice(pivot + 1).reverse();
  values.push(...tail);
  return true;
};

export const forEachTuple = (
  items: readonly number[],
  k: number,
  ordered: boolean,
  visit: (tuple: readonly number[]) => void,
) => {
  const n = items.length;
  if (k > n) return;
  const positions = Array.from({ length: k }, (_, index) => index);

  for (;;) {
    const subset = positions.map((position) => items[position] ?? 0);
    if (ordered) {
      const permutation = [...subset];
      // The permutation array is reused between visits: callers copy what they keep (массив перестановки переиспользуется — вызывающий копирует то, что сохраняет).
      do visit(permutation);
      while (nextPermutation(permutation));
    } else {
      visit(subset);
    }

    let index = k - 1;
    while (index >= 0 && (positions[index] ?? 0) === n - k + index) index -= 1;
    if (index < 0) return;
    positions[index] = (positions[index] ?? 0) + 1;
    for (let next = index + 1; next < k; next += 1)
      positions[next] = (positions[next - 1] ?? 0) + 1;
  }
};

export const sampleTuples = (
  items: readonly number[],
  k: number,
  ordered: boolean,
  rng: Rng,
  size: number,
): number[][] => {
  const seen = new Set<string>();
  const result: number[][] = [];
  const count = Math.min(size, spaceSize(items.length, k, ordered));

  while (result.length < count) {
    const tuple: number[] = [];
    while (tuple.length < k) {
      const item = pick(rng, items);
      if (!tuple.includes(item)) tuple.push(item);
    }
    const canonical = ordered ? tuple : [...tuple].sort((a, b) => a - b);
    const key = canonical.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(canonical);
    }
  }

  return result;
};

export const sampleIndices = (total: number, rng: Rng, size: number) => {
  const chosen = new Set<number>();
  while (chosen.size < Math.min(size, total)) chosen.add(randInt(rng, 0, total - 1));

  return [...chosen].sort((a, b) => a - b);
};
