import { xpToNext } from "@reckon-path/engine";

import { clearMockState, loadMockState, saveMockState } from "./mock-state";

const STATE_NAME = "player";

let totalXp = loadMockState<number>(STATE_NAME, 0);

export const resetMockPlayer = () => {
  totalXp = 0;
  clearMockState(STATE_NAME);
};

export const creditXp = (amount: number) => {
  totalXp += amount;
  saveMockState(STATE_NAME, totalXp);
};

export const mockPlayerLevel = () => {
  let level = 1;
  let xp = totalXp;
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
  }
  return { level, xp, xpToNext: xpToNext(level) };
};
