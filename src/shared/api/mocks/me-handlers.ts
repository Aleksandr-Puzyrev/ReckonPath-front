import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockPlayerLevel } from "./mock-player";
import { mockUrl } from "./mock-url";
import { chargeEmeralds, mockWallet } from "./mock-wallet";

const DELETION_DAYS = 30;
const DAY_MS = 86_400_000;
const HTTP_ACCEPTED = 202;
const HTTP_UNPROCESSABLE = 422;
const HTTP_CONFLICT = 409;
// The wrong password of the account tests, as on sign-in (неверный пароль аккаунта в тестах, как при входе).
const WRONG_PASSWORD = "000000";
const HTTP_BAD_REQUEST = 400;
// The backend's defaults of nick_change_price and nick_cooldown_days (значения бэкенда по умолчанию).
const NICK_CHANGE_PRICE = 100;
const NICK_COOLDOWN_DAYS = 30;
const PAID_CHANGES_BEFORE_COOLDOWN = 2;
const START_NICKNAME = "Player4821";
export const MOCK_TAKEN_NICKNAME = "kira";

const ME = {
  id: "0192a000-0000-7000-8000-000000004821",
  arena: { trophies: 0, league: "bronze", division: "III" },
};
const DEFAULT_LOCALE = "ru";

const CONSENT_TYPES = ["terms", "privacy", "marketing"] as const;
const REQUIRED_CONSENTS = ["terms", "privacy"] as const;
const CONSENT_VERSION = "1";

type ConsentType = (typeof CONSENT_TYPES)[number];

const patchSchema = z.object({
  locale: z.enum(["ru", "en"]).optional(),
  nickname: z.string().optional(),
});
const NICKNAME_PATTERN = /^[A-Za-z0-9_]{3,16}$/;
const deleteSchema = z.object({ password: z.string() });
const consentsSchema = z.object({
  consents: z.array(z.object({ type: z.enum(CONSENT_TYPES), accepted: z.boolean() })).min(1),
});

const acceptedAtSignUp = (): Record<ConsentType, boolean> => ({
  terms: true,
  privacy: true,
  marketing: false,
});

let locale: string | null = null;
let deletionScheduledAt: string | null = null;
let consents = acceptedAtSignUp();
let nickname = START_NICKNAME;
let nicknameChanges: string[] = [];

export const resetMockMe = () => {
  locale = null;
  nickname = START_NICKNAME;
  nicknameChanges = [];
  deletionScheduledAt = null;
  consents = acceptedAtSignUp();
};

export const requireMockConsent = (type: ConsentType) => {
  consents = { ...consents, [type]: false };
};

const consentsStateOf = () => ({
  consents: CONSENT_TYPES.map((type) => ({
    type,
    accepted: consents[type],
    version: CONSENT_VERSION,
  })),
  consentsRequired: REQUIRED_CONSENTS.filter((type) => !consents[type]),
});

export const mockLocale = () => locale;

const purgeAfterOf = (scheduledAt: string) =>
  new Date(Date.parse(scheduledAt) + DELETION_DAYS * DAY_MS).toISOString();

const nicknameChangeOf = () => {
  const last = nicknameChanges.at(-1);
  if (last === undefined) return { price: 0, currency: "gems" };
  if (nicknameChanges.length < PAID_CHANGES_BEFORE_COOLDOWN) {
    return { price: NICK_CHANGE_PRICE, currency: "gems" };
  }
  const availableAt = new Date(Date.parse(last) + NICK_COOLDOWN_DAYS * DAY_MS).toISOString();
  return { price: NICK_CHANGE_PRICE, currency: "gems", availableAt };
};

const meOf = () => ({
  ...ME,
  nickname,
  nicknameChange: nicknameChangeOf(),
  locale: locale ?? DEFAULT_LOCALE,
  ...mockPlayerLevel(),
  flags:
    deletionScheduledAt === null
      ? { deletionScheduledAt }
      : { deletionScheduledAt, purgeAfter: purgeAfterOf(deletionScheduledAt) },
  ...consentsStateOf(),
});

const validation = () =>
  HttpResponse.json({ error: { code: "validation_failed" } }, { status: HTTP_BAD_REQUEST });

const errorResponse = (code: string, status: number, details?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, details } }, { status });

const changeNickname = (next: string) => {
  if (!NICKNAME_PATTERN.test(next)) {
    return errorResponse("validation_failed", HTTP_UNPROCESSABLE, {
      fields: { nickname: "Ник: 3–16 символов, латиница, цифры и _." },
    });
  }
  if (next.toLowerCase() === MOCK_TAKEN_NICKNAME) {
    return errorResponse("nick_taken", HTTP_CONFLICT);
  }
  const { price, availableAt } = nicknameChangeOf();
  if (availableAt !== undefined && Date.now() < Date.parse(availableAt)) {
    return errorResponse("nick_change_cooldown", HTTP_CONFLICT, { availableAt });
  }
  if (!chargeEmeralds(price)) {
    return errorResponse("not_enough_gems", HTTP_CONFLICT, {
      need: price - mockWallet().emeralds,
      currency: "gems",
    });
  }
  nickname = next;
  nicknameChanges = [...nicknameChanges, new Date().toISOString()];
  return null;
};

export const meHandlers = [
  http.get(mockUrl("/me"), () => HttpResponse.json(meOf())),
  http.patch(mockUrl("/me"), async ({ request }) => {
    const body = patchSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return validation();
    const { nickname: next } = body.data;
    if (next !== undefined && next !== nickname) {
      const rejection = changeNickname(next);
      if (rejection !== null) return rejection;
    }
    locale = body.data.locale ?? locale;
    return HttpResponse.json(meOf());
  }),
  http.delete(mockUrl("/me"), async ({ request }) => {
    const body = deleteSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return validation();
    if (body.data.password === WRONG_PASSWORD) {
      return HttpResponse.json(
        { error: { code: "wrong_password" } },
        { status: HTTP_UNPROCESSABLE },
      );
    }
    deletionScheduledAt = deletionScheduledAt ?? new Date().toISOString();
    return HttpResponse.json(
      { purgeAfter: purgeAfterOf(deletionScheduledAt) },
      { status: HTTP_ACCEPTED },
    );
  }),
  http.put(mockUrl("/me/consents"), async ({ request }) => {
    const body = consentsSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return validation();
    body.data.consents.forEach(({ type, accepted }) => {
      consents = { ...consents, [type]: accepted };
    });
    return HttpResponse.json(consentsStateOf());
  }),
  http.post(mockUrl("/me/restore"), () => {
    if (deletionScheduledAt === null) {
      return HttpResponse.json({ error: { code: "not_scheduled" } }, { status: HTTP_CONFLICT });
    }
    deletionScheduledAt = null;
    return HttpResponse.json(meOf());
  }),
];
