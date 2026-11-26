import { uuidv7 } from "uuidv7";

import { apiClient } from "./api-client";
import { hasAccount } from "./api-session";
import { readEmpty } from "./read-empty";

let pending: Promise<unknown> = Promise.resolve();

// Logout and token writes use one serial queue so a token cannot be registered after logout's cleanup.
export const runCurrentPushOperation = <T>(operation: () => Promise<T>) => {
  const next = pending.then(operation);
  pending = next.catch(() => undefined);
  return next;
};

const headers = () => ({ "Idempotency-Key": uuidv7() });

export const registerCurrentFcmToken = (token: string, shouldRegister: () => boolean) =>
  runCurrentPushOperation(async () => {
    if (!hasAccount() || !shouldRegister()) return false;
    readEmpty(
      await apiClient.PUT("/me/devices/current/push-tokens", {
        body: { provider: "fcm", token },
        headers: headers(),
      }),
    );
    return true;
  });

// Call within runCurrentPushOperation when clearing tokens as part of another operation.
export const clearCurrentPushTokens = async () =>
  readEmpty(await apiClient.DELETE("/me/devices/current/push-tokens", { headers: headers() }));

export const clearCurrentFcmToken = (shouldClear: () => boolean) =>
  runCurrentPushOperation(async () => {
    if (!hasAccount() || !shouldClear()) return;
    readEmpty(
      await apiClient.DELETE("/me/devices/current/push-tokens/{provider}", {
        params: { path: { provider: "fcm" } },
        headers: headers(),
      }),
    );
  });
