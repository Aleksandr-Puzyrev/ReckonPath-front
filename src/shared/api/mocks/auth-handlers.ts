import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockUrl } from "./mock-url";

const ACCESS_TTL_S = 900;
const HTTP_CREATED = 201;
const HTTP_UNAUTHORIZED = 401;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const HTTP_NO_CONTENT = 204;
const GUEST = { id: "0192a000-0000-7000-8000-000000004821", nickname: "Player4821", isGuest: true };
// The saved account and the wrong password of design 26.2 and 1.3; «kira» is taken in design 1.4 (сохранённый аккаунт и неверный пароль из дизайна 26.2 и 1.3; ник «kira» занят в дизайне 1.4).
const SAVED_ACCOUNT = {
  user: { id: "0192a000-0000-7000-8000-000000000058", nickname: "Nova_58", isGuest: false },
  summary: { level: 58, league: "GOLD I", stars: 512 },
};
const WRONG_PASSWORD = "000000";
const TAKEN_NICKNAME = "kira";

const refreshBodySchema = z.object({ refreshToken: z.string() });
const registerBodySchema = z.object({ nickname: z.string() });
const loginBodySchema = z.object({ password: z.string() });

const errorResponse = (code: string, status: number) =>
  HttpResponse.json({ error: { code } }, { status });

let issued = 0;
let validRefreshTokens = new Set<string>();

const issueTokenPair = () => {
  issued += 1;
  const refreshToken = `r_${issued}`;
  validRefreshTokens.add(refreshToken);
  return { accessToken: `a_${issued}`, refreshToken, expiresIn: ACCESS_TTL_S };
};

export const resetMockAuth = () => {
  issued = 0;
  validRefreshTokens = new Set();
};

export const authHandlers = [
  http.post(mockUrl("/auth/guest"), () =>
    HttpResponse.json({ ...issueTokenPair(), user: GUEST }, { status: HTTP_CREATED }),
  ),
  http.post(mockUrl("/auth/refresh"), async ({ request }) => {
    const { refreshToken } = refreshBodySchema.parse(await request.json());
    // Reusing a rotated token revokes the whole session, as on the server (повтор старого токена отзывает всю сессию, как на сервере).
    if (!validRefreshTokens.delete(refreshToken)) {
      validRefreshTokens.clear();
      return HttpResponse.json(
        { error: { code: "SESSION_REVOKED" } },
        { status: HTTP_UNAUTHORIZED },
      );
    }
    return HttpResponse.json(issueTokenPair());
  }),
  http.post(mockUrl("/auth/logout"), async ({ request }) => {
    const { refreshToken } = refreshBodySchema.parse(await request.json());
    validRefreshTokens.delete(refreshToken);
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
  http.post(mockUrl("/auth/register"), async ({ request }) => {
    const { nickname } = registerBodySchema.parse(await request.json());
    if (nickname.toLowerCase() === TAKEN_NICKNAME)
      return errorResponse("NICK_TAKEN", HTTP_CONFLICT);
    return HttpResponse.json({ user: { id: GUEST.id, nickname, isGuest: false } });
  }),
  http.post(mockUrl("/auth/login"), async ({ request }) => {
    const { password } = loginBodySchema.parse(await request.json());
    if (password === WRONG_PASSWORD) {
      return errorResponse("INVALID_CREDENTIALS", HTTP_UNPROCESSABLE);
    }
    return HttpResponse.json({ ...issueTokenPair(), ...SAVED_ACCOUNT });
  }),
];
