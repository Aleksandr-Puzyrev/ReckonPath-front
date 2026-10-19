import { surrenderLoss } from "./surrender-loss";

const opponent = (trophies: number, isBot = false) => ({
  id: "u2",
  nickname: "Kira",
  league: "GOLD",
  trophies,
  isBot,
});

describe("surrenderLoss", () => {
  test("names the exact trophy loss of a defeat (PVP-15)", () => {
    expect(surrenderLoss(2640, opponent(2710))).toBe(27);
  });

  test("halves it against the bot", () => {
    expect(surrenderLoss(2640, opponent(2640, true))).toBe(15);
  });

  test("never goes below zero trophies (PVP-23)", () => {
    expect(surrenderLoss(5, opponent(0))).toBe(5);
  });
});
