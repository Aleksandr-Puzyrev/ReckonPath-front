import { FRIEND_STATUS_TEXT_KEY, friendStatusOf } from "./friend-status";

describe("friendStatusOf", () => {
  test("keeps the status the server sends", () => {
    expect(friendStatusOf({ status: "in_match" })).toBe("in_match");
  });

  test("treats a missing status as offline", () => {
    expect(friendStatusOf({})).toBe("offline");
  });

  test("names every status with its text", () => {
    expect(FRIEND_STATUS_TEXT_KEY).toEqual({
      online: "friends.status.online",
      in_match: "friends.status.inMatch",
      offline: "friends.offline",
    });
  });
});
