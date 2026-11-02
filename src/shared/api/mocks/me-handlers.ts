import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockPlayerLevel } from "./mock-player";
import { mockWallet } from "./mock-wallet";
import { mockUrl } from "./mock-url";

const DELETION_DAYS = 30;
const DAY_MS = 86_400_000;
const HTTP_NO_CONTENT = 204;
const HTTP_ACCEPTED = 202;
const HTTP_UNPROCESSABLE = 422;
// The wrong password of the account tests, as on sign-in (неверный пароль аккаунта в тестах, как при входе).
const WRONG_PASSWORD = "000000";
const HTTP_BAD_REQUEST = 400;

const ME = {
  id: "0192a000-0000-7000-8000-000000004821",
  nickname: "Player4821",
  isGuest: true,
  providers: [],
  arena: { trophies: 0, league: "BRONZE", division: 3, peak: 0, rp: 0, seasonId: 2 },
  friendCode: "PL4821",
};

const patchSchema = z.object({ locale: z.enum(["ru", "en"]).optional() });
const deleteSchema = z.object({ password: z.string() });

let locale: string | null = null;
let deletionScheduledAt: string | null = null;

export const resetMockMe = () => {
  locale = null;
  deletionScheduledAt = null;
};

export const mockLocale = () => locale;

const meOf = () => ({
  ...ME,
  ...mockPlayerLevel(),
  flags: { nickChangeFreeAvailable: true, nickChangeAvailableAt: null, deletionScheduledAt },
  wallet: mockWallet(),
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
    deletionScheduledAt = new Date(Date.now() + DELETION_DAYS * DAY_MS).toISOString();
    return HttpResponse.json({ purgeAfter: deletionScheduledAt }, { status: HTTP_ACCEPTED });
  }),
  http.post(mockUrl("/me/restore"), () => {
    deletionScheduledAt = null;
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
];
