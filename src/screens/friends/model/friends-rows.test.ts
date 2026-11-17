import { friendsRowsOf } from "./friends-rows";

const user = (id: string) => ({ id, name: id, trophies: 100, league: "bronze" });
const request = (id: string) => ({
  id,
  user: user(`user-${id}`),
  createdAt: "2026-11-16T10:00:00Z",
});

const LIST = {
  friends: [
    { ...user("b"), status: "online" as const },
    { ...user("a"), status: "offline" as const },
  ],
  incoming: [request("in-1")],
  outgoing: [request("out-1")],
  counts: { friends: 2, online: 1, incoming: 1 },
};

describe("friendsRowsOf", () => {
  test("keeps the server order of friends (decision 0062)", () => {
    expect(friendsRowsOf(LIST, "friends").map(({ key }) => key)).toEqual(["friend-b", "friend-a"]);
  });

  test("puts my sent requests under a title after the incoming ones (decision 0062 #9)", () => {
    expect(friendsRowsOf(LIST, "requests").map(({ kind }) => kind)).toEqual([
      "incoming",
      "outgoingTitle",
      "outgoing",
    ]);
  });

  test("leaves the title out without sent requests", () => {
    expect(friendsRowsOf({ ...LIST, outgoing: [] }, "requests").map(({ kind }) => kind)).toEqual([
      "incoming",
    ]);
  });
});
