import type { components } from "../generated/schema";

import type { MockReply } from "./mock-campaign-play";

type FriendView = components["schemas"]["FriendView"];
type FriendStatus = components["schemas"]["FriendStatus"];
type FriendRelation = components["schemas"]["FriendRelation"];
type FriendsList = components["schemas"]["FriendsList"];
type FoundPlayer = components["schemas"]["FoundPlayer"];
type Invite = components["schemas"]["Invite"];

interface MockPlayer {
  id: string;
  name: string;
  trophies: number;
  league: string;
  inviteCode: string;
}

interface MockRequest {
  id: string;
  from: string;
  to: string;
  createdAt: string;
}

interface MockFriendsState {
  friends: Record<string, FriendStatus>;
  requests: MockRequest[];
  blocked: string[];
  invitedBy: string | null;
  isInviteExpired: boolean;
}

export const MOCK_ME_ID = "me";
export const MOCK_INVITE_CODE = "K7M2QX9A";
const MAX_FRIENDS = 200;
const MAX_OUTGOING_REQUESTS = 50;
const SEARCH_MIN_LENGTH = 3;
const NICKNAME_MAX_LENGTH = 16;
const SEARCH_LIMIT = 20;
const INVITE_GEMS = 20;
const INVITE_LIMIT = 50;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const CREATED_AT = "2026-11-16T10:00:00.000Z";

// Friends share ids with the daily top, so its friends tab shows them (у друзей те же id, что в топе дня, поэтому вкладка друзей показывает их).
export const MOCK_PLAYERS: readonly MockPlayer[] = [
  { id: "mock-2", name: "Kira", trophies: 2640, league: "gold", inviteCode: "KIRA2345" },
  { id: "mock-5", name: "Milo", trophies: 1450, league: "silver", inviteCode: "MILO2345" },
  { id: "mock-1", name: "Nova", trophies: 3120, league: "platinum", inviteCode: "NOVA2345" },
  { id: "player-4", name: "Timur", trophies: 980, league: "bronze", inviteCode: "TIMR2345" },
  { id: "player-5", name: "Vera", trophies: 2210, league: "gold", inviteCode: "VERA2345" },
  { id: "player-6", name: "Mila", trophies: 1820, league: "silver", inviteCode: "MILA2345" },
  { id: "player-7", name: "Miron", trophies: 760, league: "bronze", inviteCode: "MIRN2345" },
  { id: "player-8", name: "Gleb", trophies: 1990, league: "silver", inviteCode: "GLEB2345" },
];

const initialState = (): MockFriendsState => ({
  friends: { "mock-1": "offline", "mock-2": "online", "mock-5": "in_match" },
  requests: [
    { id: "request-1", from: "player-4", to: MOCK_ME_ID, createdAt: CREATED_AT },
    { id: "request-2", from: "player-5", to: MOCK_ME_ID, createdAt: CREATED_AT },
    { id: "request-3", from: MOCK_ME_ID, to: "player-6", createdAt: CREATED_AT },
  ],
  blocked: [],
  invitedBy: null,
  isInviteExpired: false,
});

let state = initialState();
let requestCount = 0;

export const resetMockFriends = () => {
  state = initialState();
  requestCount = 0;
};

export const setMockFriends = (next: Partial<MockFriendsState>) => {
  state = { ...state, ...next };
};

const fail = (
  error: string,
  status: number,
  details?: Record<string, unknown>,
): MockReply<never> => ({ error, status, ...(details === undefined ? {} : { details }) });

const ok = <T>(data: T): MockReply<T> => ({ data });

const playerOf = (id: string) => MOCK_PLAYERS.find((player) => player.id === id);

const viewOf = ({ id, name, trophies, league }: MockPlayer, status?: FriendStatus): FriendView => ({
  id,
  name,
  trophies,
  league,
  ...(status === undefined ? {} : { status }),
});

const STATUS_ORDER: Record<FriendStatus, number> = { online: 0, in_match: 1, offline: 2 };

const requestViewOf = (request: MockRequest, userId: string) => {
  const player = playerOf(userId);
  return player === undefined
    ? []
    : [{ id: request.id, user: viewOf(player), createdAt: request.createdAt }];
};

const friendIds = () => Object.keys(state.friends);
const isFriend = (id: string) => state.friends[id] !== undefined;
const pendingBetween = (from: string, to: string) =>
  state.requests.find((request) => request.from === from && request.to === to);

export const mockFriendIds = friendIds;

// The backend's order: online, then in a match, then offline (порядок бэкенда: онлайн, затем в матче, затем не в сети).
export const listMockFriends = (): FriendsList => {
  const friends = MOCK_PLAYERS.filter(({ id }) => isFriend(id))
    .map((player) => viewOf(player, state.friends[player.id] ?? "offline"))
    .sort(
      (left, right) =>
        STATUS_ORDER[left.status ?? "offline"] - STATUS_ORDER[right.status ?? "offline"],
    );
  const incoming = state.requests
    .filter(({ to }) => to === MOCK_ME_ID)
    .flatMap((request) => requestViewOf(request, request.from));
  const outgoing = state.requests
    .filter(({ from }) => from === MOCK_ME_ID)
    .flatMap((request) => requestViewOf(request, request.to));
  return {
    friends,
    incoming,
    outgoing,
    counts: {
      friends: friends.length,
      online: friends.filter(({ status }) => status !== "offline").length,
      incoming: incoming.length,
    },
  };
};

const relationOf = (id: string): FriendRelation => {
  if (isFriend(id)) return "friend";
  if (pendingBetween(id, MOCK_ME_ID) !== undefined) return "incoming";
  if (pendingBetween(MOCK_ME_ID, id) !== undefined) return "outgoing";
  return "none";
};

export const searchMockPlayers = (nickname: string): MockReply<{ users: FoundPlayer[] }> => {
  const text = nickname.trim().toLowerCase();
  if (text.length < SEARCH_MIN_LENGTH || text.length > NICKNAME_MAX_LENGTH) {
    return fail("validation_failed", HTTP_UNPROCESSABLE, {
      fields: { nickname: "Введите хотя бы 3 символа ника." },
    });
  }
  // Like the backend, a block in either direction hides the player (как у бэкенда, блокировка в любую сторону скрывает игрока).
  const users = MOCK_PLAYERS.filter(
    ({ id, name }) => !state.blocked.includes(id) && name.toLowerCase().startsWith(text),
  )
    .sort(
      (left, right) =>
        Number(right.name.toLowerCase() === text) - Number(left.name.toLowerCase() === text),
    )
    .slice(0, SEARCH_LIMIT)
    .map((player) => ({ ...viewOf(player), relation: relationOf(player.id) }));
  return ok({ users });
};

const befriend = (id: string) => {
  if (friendIds().length >= MAX_FRIENDS)
    return fail("friends_limit", HTTP_CONFLICT, { max: MAX_FRIENDS });
  state = {
    ...state,
    friends: { ...state.friends, [id]: "offline" },
    requests: state.requests.filter(
      ({ from, to }) => !(from === id && to === MOCK_ME_ID) && !(from === MOCK_ME_ID && to === id),
    ),
  };
  return null;
};

// Like the backend: a request to a player who has already asked me makes us friends at once (как у бэкенда: заявка игроку, который уже звал меня, сразу делает нас друзьями).
export const sendMockFriendRequest = (
  userId: string,
): MockReply<{ status: "sent" | "accepted"; requestId: string }> => {
  if (userId === MOCK_ME_ID) return fail("friend_self", HTTP_UNPROCESSABLE);
  if (playerOf(userId) === undefined || state.blocked.includes(userId)) {
    return fail("user_not_found", HTTP_NOT_FOUND);
  }
  if (isFriend(userId)) return fail("already_friends", HTTP_CONFLICT);
  const counter = pendingBetween(userId, MOCK_ME_ID);
  if (counter !== undefined) {
    const limit = befriend(userId);
    return limit ?? ok({ status: "accepted", requestId: counter.id });
  }
  if (pendingBetween(MOCK_ME_ID, userId) !== undefined)
    return fail("request_exists", HTTP_CONFLICT);
  const outgoing = state.requests.filter(({ from }) => from === MOCK_ME_ID).length;
  if (outgoing >= MAX_OUTGOING_REQUESTS) {
    return fail("requests_limit", HTTP_CONFLICT, { max: MAX_OUTGOING_REQUESTS });
  }
  requestCount += 1;
  const request = {
    id: `request-new-${requestCount}`,
    from: MOCK_ME_ID,
    to: userId,
    createdAt: CREATED_AT,
  };
  state = { ...state, requests: [...state.requests, request] };
  return ok({ status: "sent", requestId: request.id });
};

export const answerMockFriendRequest = (id: string, isAccepted: boolean): MockReply<null> => {
  const request = state.requests.find((item) => item.id === id && item.to === MOCK_ME_ID);
  if (request === undefined) return fail("request_not_found", HTTP_NOT_FOUND);
  if (!isAccepted) {
    state = { ...state, requests: state.requests.filter((item) => item.id !== id) };
    return ok(null);
  }
  return befriend(request.from) ?? ok(null);
};

export const withdrawMockFriendRequest = (id: string): MockReply<null> => {
  if (!state.requests.some((item) => item.id === id && item.from === MOCK_ME_ID)) {
    return fail("request_not_found", HTTP_NOT_FOUND);
  }
  state = { ...state, requests: state.requests.filter((item) => item.id !== id) };
  return ok(null);
};

export const removeMockFriend = (userId: string): MockReply<null> => {
  if (!isFriend(userId)) return fail("not_friends", HTTP_NOT_FOUND);
  const friends = Object.entries(state.friends).filter(([id]) => id !== userId);
  state = { ...state, friends: Object.fromEntries(friends) };
  return ok(null);
};

export const mockInvite = (): Invite => ({
  code: MOCK_INVITE_CODE,
  invited: 0,
  rewarded: 0,
  rewardGems: INVITE_GEMS,
  limit: INVITE_LIMIT,
  ...(state.invitedBy === null ? {} : { invitedBy: state.invitedBy }),
});

// Like the backend: once, only in the first days, and the players become friends; the friend limit does not fail the code (как у бэкенда: один раз, только в первые дни, и игроки становятся друзьями; лимит друзей код не отменяет).
export const redeemMockInvite = (code: string): MockReply<null> => {
  const text = code.trim().toUpperCase();
  if (state.isInviteExpired) return fail("invite_expired", HTTP_CONFLICT);
  if (text === MOCK_INVITE_CODE) return fail("invite_self", HTTP_UNPROCESSABLE);
  const inviter = MOCK_PLAYERS.find(({ inviteCode }) => inviteCode === text);
  if (inviter === undefined || state.blocked.includes(inviter.id)) {
    return fail("invite_invalid", HTTP_NOT_FOUND);
  }
  if (state.invitedBy !== null) return fail("invite_used", HTTP_CONFLICT);
  state = { ...state, invitedBy: inviter.id };
  if (!isFriend(inviter.id)) befriend(inviter.id);
  return ok(null);
};
