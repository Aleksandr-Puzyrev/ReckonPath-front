import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockUrl } from "./mock-url";

const ACCESS_TTL_S = 900;
const HTTP_CREATED = 201;
const HTTP_UNAUTHORIZED = 401;
const GUEST = { id: "0192a000-0000-7000-8000-000000004821", nickname: "Player4821", isGuest: true };

const refreshBodySchema = z.object({ refreshToken: z.string() });

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
];
