import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockPlayerLevel } from "./mock-player";
import { mockShopState } from "./mock-shop";
import { mockWallet } from "./mock-wallet";
import { mockUrl } from "./mock-url";

const DELETION_DAYS = 30;
const DAY_MS = 86_400_000;
const HTTP_NO_CONTENT = 204;
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
const deleteSchema = z.object({ confirmNickname: z.string() });

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
  loadout: mockShopState().loadout,
});

const validation = () =>
  HttpResponse.json({ error: { code: "VALIDATION" } }, { status: HTTP_BAD_REQUEST });

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
    if (!body.success || body.data.confirmNickname.trim() !== ME.nickname) return validation();
    deletionScheduledAt = new Date(Date.now() + DELETION_DAYS * DAY_MS).toISOString();
    return HttpResponse.json({ deletionScheduledAt });
  }),
  http.post(mockUrl("/me/restore"), () => {
    deletionScheduledAt = null;
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
];
