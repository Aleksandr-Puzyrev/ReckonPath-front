import type { components } from "../generated/schema";

import { MOCK_FORMAT } from "./mock-arena";
import type { MockReply } from "./mock-campaign-play";
import { MOCK_ME_ID, MOCK_PLAYERS, mockFriendStatus } from "./mock-friends";
import { currentMockMatch, setMockMatch } from "./match-handlers";
import { matchViewMock } from "./mock-match";

type ChallengeView = components["schemas"]["ChallengeView"];
type ChallengeStatus = components["schemas"]["ChallengeStatus"];
type ChallengesResponse = components["schemas"]["ChallengesResponse"];
type MatchView = components["schemas"]["MatchView"];

export interface MockChallenge {
  id: string;
  from: string;
  to: string;
  status: ChallengeStatus;
  expiresAt: string;
}

const SECOND_MS = 1000;
const CHALLENGE_SECONDS = 60;
const MOCK_ME_NAME = "test";
const FRIENDLY_MATCH_ID = "match-friendly";
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

let challenges: MockChallenge[] = [];
let challengeCount = 0;

export const resetMockChallenges = () => {
  challenges = [];
  challengeCount = 0;
};

export const setMockChallenges = (next: MockChallenge[]) => {
  challenges = next;
};

const fail = (
  error: string,
  status: number,
  details?: Record<string, unknown>,
): MockReply<never> => ({
  error,
  status,
  ...(details === undefined ? {} : { details }),
});

const nameOf = (id: string) =>
  id === MOCK_ME_ID ? MOCK_ME_NAME : (MOCK_PLAYERS.find((player) => player.id === id)?.name ?? id);

export const challengeViewMock = (challenge: MockChallenge): ChallengeView => ({
  id: challenge.id,
  status: challenge.status,
  from: { id: challenge.from, name: nameOf(challenge.from) },
  to: { id: challenge.to, name: nameOf(challenge.to) },
  incoming: challenge.to === MOCK_ME_ID,
  format: MOCK_FORMAT,
  expiresAt: challenge.expiresAt,
});

export const incomingChallengeMock = (
  overrides: Partial<MockChallenge> = {},
  now = Date.now(),
): MockChallenge => ({
  id: "challenge-in",
  from: "mock-2",
  to: MOCK_ME_ID,
  status: "pending",
  expiresAt: new Date(now + CHALLENGE_SECONDS * SECOND_MS).toISOString(),
  ...overrides,
});

const isPending = (challenge: MockChallenge, now: number) =>
  challenge.status === "pending" && Date.parse(challenge.expiresAt) > now;

const runningMatch = () => {
  const match = currentMockMatch();
  return match === null || match.status === "done" ? null : match;
};

const change = (challenge: MockChallenge, status: ChallengeStatus) => {
  challenges = challenges.map((current) =>
    current.id === challenge.id ? { ...current, status } : current,
  );
};

export const listMockChallenges = (now = Date.now()): ChallengesResponse => {
  const pending = challenges.filter((challenge) => isPending(challenge, now));
  return {
    incoming: pending.filter(({ to }) => to === MOCK_ME_ID).map(challengeViewMock),
    outgoing: pending.filter(({ from }) => from === MOCK_ME_ID).map(challengeViewMock),
  };
};

// The backend's order of checks: friendship, my match, the friend's match; a new challenge silently cancels my pending one (порядок проверок бэкенда: дружба, мой матч, матч друга; новый вызов молча отменяет мой ожидающий).
export const sendMockChallenge = (friendId: string, now = Date.now()): MockReply<ChallengeView> => {
  const status = mockFriendStatus(friendId);
  if (status === undefined) return fail("not_friends", HTTP_FORBIDDEN);
  const match = runningMatch();
  if (match !== null) {
    return fail("match_in_progress", HTTP_CONFLICT, {
      id: match.id,
      kind: match.kind,
      status: match.status,
    });
  }
  if (status === "in_match") return fail("rival_busy", HTTP_CONFLICT);
  challenges = challenges.map((challenge) =>
    challenge.from === MOCK_ME_ID && isPending(challenge, now)
      ? { ...challenge, status: "cancelled" }
      : challenge,
  );
  challengeCount += 1;
  const challenge: MockChallenge = {
    id: `challenge-${challengeCount}`,
    from: MOCK_ME_ID,
    to: friendId,
    status: "pending",
    expiresAt: new Date(now + CHALLENGE_SECONDS * SECOND_MS).toISOString(),
  };
  challenges = [...challenges, challenge];
  return { data: challengeViewMock(challenge) };
};

const pendingOf = (id: string, now: number) =>
  challenges.find((challenge) => challenge.id === id && isPending(challenge, now));

export const acceptMockChallenge = (id: string, now = Date.now()): MockReply<MatchView> => {
  const challenge = pendingOf(id, now);
  if (challenge === undefined || challenge.to !== MOCK_ME_ID) {
    return fail("challenge_not_found", HTTP_NOT_FOUND);
  }
  const running = runningMatch();
  if (running !== null) {
    return fail("match_in_progress", HTTP_CONFLICT, {
      id: running.id,
      kind: running.kind,
      status: running.status,
    });
  }
  const base = matchViewMock({ id: FRIENDLY_MATCH_ID, friendly: true, surrenderLoss: 0 }, now);
  const match = {
    ...base,
    rival: { ...base.rival, id: challenge.from, name: nameOf(challenge.from) },
  };
  setMockMatch(match);
  change(challenge, "accepted");
  return { data: match };
};

export const closeMockChallenge = (
  id: string,
  isIncoming: boolean,
  now = Date.now(),
): MockReply<null> => {
  const challenge = pendingOf(id, now);
  const owner = isIncoming ? challenge?.to : challenge?.from;
  if (challenge === undefined || owner !== MOCK_ME_ID) {
    return fail("challenge_not_found", HTTP_NOT_FOUND);
  }
  change(challenge, isIncoming ? "declined" : "cancelled");
  return { data: null };
};
