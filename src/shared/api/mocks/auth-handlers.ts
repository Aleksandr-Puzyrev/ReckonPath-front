import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockUrl } from "./mock-url";

const ACCESS_TTL_S = 900;
const RESEND_AFTER_S = 60;
const MAX_CODE_ATTEMPTS = 5;
const HTTP_ACCEPTED = 202;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_UNPROCESSABLE = 422;
const HTTP_TOO_MANY = 429;
const HTTP_NO_CONTENT = 204;
// Test values: every code is «123456», «000000» is the wrong password, «qwerty123» is too easy for the server (тестовые значения: код всегда «123456», «000000» — неверный пароль, «qwerty123» сервер считает слишком простым).
export const MOCK_CODE = "123456";
export const MOCK_WRONG_PASSWORD = "000000";
export const MOCK_REJECTED_PASSWORD = "qwerty123";

const emailBodySchema = z.object({ email: z.string() });
const registerBodySchema = z.object({ email: z.string(), password: z.string() });
const verifyBodySchema = z.object({ email: z.string(), code: z.string() });
const loginBodySchema = z.object({ email: z.string(), password: z.string() });
const refreshBodySchema = z.object({ refreshToken: z.string() });

const errorResponse = (code: string, status: number, details?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, details } }, { status });

const codeSent = () =>
  HttpResponse.json({ resendAfter: RESEND_AFTER_S }, { status: HTTP_ACCEPTED });

let issued = 0;
let validRefreshTokens = new Set<string>();
let unverified = new Map<string, number>();

const issueTokenPair = () => {
  issued += 1;
  const refreshToken = `r_${issued}`;
  validRefreshTokens.add(refreshToken);
  return { accessToken: `a_${issued}`, refreshToken, expiresIn: ACCESS_TTL_S };
};

export const resetMockAuth = () => {
  issued = 0;
  validRefreshTokens = new Set();
  unverified = new Map();
};

export const authHandlers = [
  http.post(mockUrl("/auth/register"), async ({ request }) => {
    const { email, password } = registerBodySchema.parse(await request.json());
    if (password === MOCK_REJECTED_PASSWORD) {
      return errorResponse("validation_failed", HTTP_UNPROCESSABLE, {
        fields: { password: "Слишком простой пароль." },
      });
    }
    unverified.set(email, 0);
    return codeSent();
  }),
  http.post(mockUrl("/auth/register/resend"), async ({ request }) => {
    const { email } = emailBodySchema.parse(await request.json());
    unverified.set(email, 0);
    return codeSent();
  }),
  http.post(mockUrl("/auth/register/verify"), async ({ request }) => {
    const { email, code } = verifyBodySchema.parse(await request.json());
    const attempts = unverified.get(email) ?? 0;
    if (attempts >= MAX_CODE_ATTEMPTS) return errorResponse("too_many_attempts", HTTP_TOO_MANY);
    if (code !== MOCK_CODE) {
      unverified.set(email, attempts + 1);
      return errorResponse("invalid_code", HTTP_UNPROCESSABLE);
    }
    unverified.delete(email);
    return HttpResponse.json(issueTokenPair());
  }),
  http.post(mockUrl("/auth/login"), async ({ request }) => {
    const { email, password } = loginBodySchema.parse(await request.json());
    if (password === MOCK_WRONG_PASSWORD) {
      return errorResponse("invalid_credentials", HTTP_UNAUTHORIZED);
    }
    if (unverified.has(email)) return errorResponse("email_not_verified", HTTP_FORBIDDEN);
    return HttpResponse.json(issueTokenPair());
  }),
  http.post(mockUrl("/auth/refresh"), async ({ request }) => {
    const { refreshToken } = refreshBodySchema.parse(await request.json());
    // Reusing a rotated token revokes the whole session, as on the server (повтор старого токена отзывает всю сессию, как на сервере).
    if (!validRefreshTokens.delete(refreshToken)) {
      validRefreshTokens.clear();
      return errorResponse("refresh_token_reused", HTTP_UNAUTHORIZED);
    }
    return HttpResponse.json(issueTokenPair());
  }),
  http.post(mockUrl("/auth/logout"), () => new HttpResponse(null, { status: HTTP_NO_CONTENT })),
];
