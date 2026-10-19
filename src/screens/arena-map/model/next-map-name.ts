export const nextMapNumber = (names: readonly string[], nameOf: (n: number) => string) => {
  let n = 1;
  while (names.includes(nameOf(n))) n += 1;
  return n;
};
