import type * as AuthSession from "expo-auth-session";

import { ApiError } from "@shared/api";
import type { components } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";

type Provider = components["schemas"]["OAuthProvider"];
type Code = components["schemas"]["OAuthCode"];

export const OAUTH_PROVIDERS = ["vkid", "yandex"] as const;
export type OAuthProvider = Provider;

const settings = {
  vkid: {
    clientId: process.env.EXPO_PUBLIC_VKID_CLIENT_ID ?? "",
    redirectUri: process.env.EXPO_PUBLIC_VKID_REDIRECT_URI ?? "reckonpath://oauth/vk",
    authorizationEndpoint: "https://id.vk.com/authorize",
  },
  yandex: {
    clientId: process.env.EXPO_PUBLIC_YANDEX_CLIENT_ID ?? "",
    redirectUri: process.env.EXPO_PUBLIC_YANDEX_REDIRECT_URI ?? "reckonpath://oauth/yandex",
    authorizationEndpoint: "https://oauth.yandex.ru/authorize",
  },
} satisfies Record<
  Provider,
  { clientId: string; redirectUri: string; authorizationEndpoint: string }
>;

export const isOAuthConfigured = (provider: Provider) =>
  HAS_BACKEND && settings[provider].clientId.trim().length > 0;

const loadAuthSession = (): typeof AuthSession => {
  // Load native browser and crypto support only when an OAuth request actually starts.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-auth-session") as typeof AuthSession;
};

export const requestOAuthCode = async (provider: Provider): Promise<Code | null> => {
  const { AuthRequest, CodeChallengeMethod, ResponseType } = loadAuthSession();
  const { clientId, redirectUri, authorizationEndpoint } = settings[provider];
  const request = new AuthRequest({
    clientId,
    redirectUri,
    responseType: ResponseType.Code,
    codeChallengeMethod: CodeChallengeMethod.S256,
    usePKCE: true,
  });
  await request.makeAuthUrlAsync({ authorizationEndpoint });
  const result = await request.promptAsync({ authorizationEndpoint });
  if (result.type === "cancel" || result.type === "dismiss" || result.type === "locked")
    return null;
  if (
    result.type !== "success" ||
    !result.params.code ||
    !request.codeVerifier ||
    result.params.state !== request.state ||
    (provider === "vkid" && !result.params.device_id)
  ) {
    throw new ApiError(401, "oauth_rejected");
  }
  return {
    code: result.params.code,
    codeVerifier: request.codeVerifier,
    redirectUri,
    state: result.params.state,
    ...(provider === "vkid" ? { vkDeviceId: result.params.device_id } : {}),
  };
};
