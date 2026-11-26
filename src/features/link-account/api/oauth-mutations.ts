import { mutationOptions } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { deviceInfo, startSession, useAccountStore } from "@entities/session";
import { apiClient, readData, readEmpty } from "@shared/api";

import { requestOAuthCode } from "../model/oauth-provider";
import type { OAuthProvider } from "../model/oauth-provider";

const options = { networkMode: "always", gcTime: 0 } as const;
const headers = () => ({ "Idempotency-Key": uuidv7() });

export interface OAuthConsents {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

export const oauthLoginOptions = () =>
  mutationOptions({
    ...options,
    mutationFn: async ({
      provider,
      consents,
    }: {
      provider: OAuthProvider;
      consents?: OAuthConsents;
    }) => {
      const code = await requestOAuthCode(provider);
      if (code === null) return false;
      const body = { ...code, ...consents, device: await deviceInfo() };
      await startSession(
        readData(
          await apiClient.POST("/auth/oauth/{provider}", {
            params: { path: { provider } },
            body,
            headers: headers(),
          }),
        ),
      );
      useAccountStore.getState().markSignedIn();
      return true;
    },
  });

interface IdentityAction {
  provider: OAuthProvider;
  isUnlinking: boolean;
  password: string;
}

export const oauthIdentityOptions = () =>
  mutationOptions({
    ...options,
    mutationFn: async ({ provider, isUnlinking, password }: IdentityAction) => {
      const params = { path: { provider } };
      const reauth = password === "" ? {} : { password };
      if (isUnlinking) {
        readEmpty(
          await apiClient.DELETE("/me/identities/{provider}", {
            params,
            body: reauth,
            headers: headers(),
          }),
        );
        return true;
      }
      const code = await requestOAuthCode(provider);
      if (code === null) return false;
      readData(
        await apiClient.POST("/me/identities/{provider}", {
          params,
          body: { ...code, ...reauth },
          headers: headers(),
        }),
      );
      return true;
    },
  });
