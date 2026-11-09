import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockPlayerLevel } from "./mock-player";
import { mockUrl } from "./mock-url";

const DELETION_DAYS = 30;
const DAY_MS = 86_400_000;
const HTTP_ACCEPTED = 202;
const HTTP_UNPROCESSABLE = 422;
const HTTP_CONFLICT = 409;
// The wrong password of the account tests, as on sign-in (неверный пароль аккаунта в тестах, как при входе).
const WRONG_PASSWORD = "000000";
const HTTP_BAD_REQUEST = 400;

const ME = {
  id: "0192a000-0000-7000-8000-000000004821",
  nickname: "Player4821",
  arena: { trophies: 0, league: "bronze", division: "III" },
  nicknameChange: { price: 0, currency: "gems" },
};
const DEFAULT_LOCALE = "ru";

const CONSENT_TYPES = ["terms", "privacy", "marketing"] as const;
const REQUIRED_CONSENTS = ["terms", "privacy"] as const;
const CONSENT_VERSION = "1";

type ConsentType = (typeof CONSENT_TYPES)[number];

const patchSchema = z.object({ locale: z.enum(["ru", "en"]).optional() });
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

export const resetMockMe = () => {
  locale = null;
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

const meOf = () => ({
  ...ME,
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

export const meHandlers = [
  http.get(mockUrl("/me"), () => HttpResponse.json(meOf())),
  http.patch(mockUrl("/me"), async ({ request }) => {
    const body = patchSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return validation();
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
