import { nextMapNumber } from "./next-map-name";

const nameOf = (n: number) => `Карта ${n}`;

describe("nextMapNumber", () => {
  test("takes the first free number (decision 0032 #3)", () => {
    expect(nextMapNumber(["Карта 1", "Карта 3"], nameOf)).toBe(2);
  });

  test("starts from one", () => {
    expect(nextMapNumber(["Fort"], nameOf)).toBe(1);
  });
});
