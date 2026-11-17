import { searchNicknameOf } from "./search-nickname";

describe("searchNicknameOf (decision 0062 #11)", () => {
  test("searches from three characters", () => {
    expect(searchNicknameOf("Kir")).toBe("Kir");
  });

  test("does not search with fewer than three characters", () => {
    expect(searchNicknameOf("Ki")).toBeNull();
  });

  test("ignores the spaces around the text", () => {
    expect(searchNicknameOf("  Ki  ")).toBeNull();
    expect(searchNicknameOf(" Kira ")).toBe("Kira");
  });
});
