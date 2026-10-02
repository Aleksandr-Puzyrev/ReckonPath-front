import type { LevelInput } from "@reckon-path/engine";

import { CAMPAIGN, LEVEL_LESSONS } from "@reckon-path/content";

import { levelCardIds, modeCardId } from "./level-cards";
import { RULE_DEMOS } from "./rule-cards";
import { isRuleCardId } from "./rules-store";

const cardsOf = (id: string) => {
  const level = CAMPAIGN.find((candidate) => candidate.id === id);
  if (level === undefined) throw new Error(`No level ${id}`);
  return levelCardIds(level, (LEVEL_LESSONS[id] ?? []).filter(isRuleCardId));
};

describe("levelCardIds", () => {
  test("introduces the beacon on level 4, flags on 7, and the fence on 13", () => {
    expect(cardsOf("c-1")).toEqual([]);
    expect(cardsOf("c-4")).toEqual(["beacon"]);
    expect(cardsOf("c-7")).toEqual(["flags"]);
    expect(cardsOf("c-13")).toEqual(["fence"]);
    expect(cardsOf("c-19")).toEqual(["fence", "beacon"]);
  });

  test("names the card of each element a level uses", () => {
    const level: LevelInput = { ...RULE_DEMOS.bridge.level, bombs: [[3, 0]], fog: 2 };
    expect(levelCardIds(level)).toEqual(["stream", "bridge", "bomb", "fog"]);
  });
});

describe("modeCardId", () => {
  test("maps the probe mode to its card", () => {
    expect(modeCardId(RULE_DEMOS.direction.level)).toBe("direction");
    expect(modeCardId(RULE_DEMOS.distance.level)).toBe("distance");
  });
});
