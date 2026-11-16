import { cardOfServerKey, serverKeyOfCard } from "./server-guide-keys";

describe("server guide keys", () => {
  test("renames the cards the backend calls otherwise (decision 0060 #7)", () => {
    expect(serverKeyOfCard("multi")).toBe("multi_target");
    expect(serverKeyOfCard("direction")).toBe("course");
    expect(serverKeyOfCard("hotcold")).toBe("hot_cold");
    expect(serverKeyOfCard("fence")).toBe("fence");
  });

  test("reads the backend keys back as cards and skips the unknown ones", () => {
    expect(cardOfServerKey("multi_target")).toBe("multi");
    expect(cardOfServerKey("hot_cold")).toBe("hotcold");
    expect(cardOfServerKey("bomb")).toBe("bomb");
    expect(cardOfServerKey("tut_first_level")).toBeNull();
  });
});
