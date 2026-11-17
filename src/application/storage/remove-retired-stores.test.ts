import { keyValueStorage } from "@shared/storage";

import { removeRetiredStores } from "./remove-retired-stores";

describe("removeRetiredStores", () => {
  test("removes the saved data of the deleted local daily stores only", () => {
    ["outbox", "game-session", "daily-records", "kept-store"].forEach((name) =>
      keyValueStorage.setItem(name, "{}"),
    );

    removeRetiredStores();

    expect(keyValueStorage.getItem("outbox")).toBeNull();
    expect(keyValueStorage.getItem("game-session")).toBeNull();
    expect(keyValueStorage.getItem("daily-records")).toBeNull();
    expect(keyValueStorage.getItem("kept-store")).toBe("{}");
    keyValueStorage.removeItem("kept-store");
  });
});
